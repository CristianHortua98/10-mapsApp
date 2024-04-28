import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { LngLat, Map, Marker } from 'mapbox-gl';

interface MarkerAndColor {

  color: string;
  marker: Marker;

}

interface PlainMarker{

  color: string;
  lngLat: number[]

}


@Component({
  templateUrl: './markers-page.component.html',
  styleUrl: './markers-page.component.css'
})
export class MarkersPageComponent implements AfterViewInit{

  @ViewChild('map') divMap?: ElementRef;

  public markers: MarkerAndColor[] = [];

  public map?: Map;
  public currentLngLat: LngLat = new LngLat(-74.07096427065684, 4.6145178193746546);

  ngAfterViewInit(): void {

    if(!this.divMap) throw 'El elemento HTML no fue encontrado';

    this.map = new Map({
      container: this.divMap.nativeElement, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this.currentLngLat, // starting position [lng, lat]
      zoom: 13, // starting zoom
    });

    this.readFromLocalStorage();

    //COMO CREAR MARKERS

    // const markerHtml = document.createElement('div');
    // markerHtml.innerHTML = 'Cristian Hortua';

    // const marker = new Marker({
    //   // color: 'red'
    //   element: markerHtml
    // })
    //   .setLngLat(this.currentLngLat)
    //   .addTo(this.map)

  }

  createMarker(){

    if( !this.map ) return;

    const color = '#xxxxxx'.replace(/x/g, y=>(Math.random()*16|0).toString(16));
    const lngLat = this.map.getCenter();

    this.addMarker(lngLat, color);

  }

  addMarker(lngLat:LngLat, color: string){

    if(!this.map) return;

    const marker = new Marker({
      color:color,
      draggable: true
    })
      .setLngLat(lngLat)
      .addTo(this.map);

    this.markers.push({
      color: color,
      marker: marker
    });

    marker.on('dragend', (event) => this.saveToLocalStorage())

  }

  deleteMarker(index: number){

    this.markers[index].marker.remove();
    this.markers.splice(index, 1);
    this.saveToLocalStorage();

  }

  flyTo(marker: Marker){

    this.map?.flyTo({
      zoom: 14,
      center: marker.getLngLat()
    });

  }

  saveToLocalStorage(){
    
    const plainMarkers: PlainMarker[] = this.markers.map( ({color, marker}) => {
      return {
        color: color,
        lngLat: marker.getLngLat().toArray()
      }
    })

    localStorage.setItem('plainMarkers', JSON.stringify(plainMarkers));

  }

  readFromLocalStorage(){

    const plainMarkersString = localStorage.getItem('plainMarkers') ?? '[]';

    const plainMarkers: PlainMarker[] = JSON.parse(plainMarkersString);

    plainMarkers.forEach(({color, lngLat}) => {

      const [ lng, lat] = lngLat;
      const coords = new LngLat(lng, lat);

      this.addMarker(coords, color);
    })

  }

}
