import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  url = environment.apiURL;

  constructor(private httpClient: HttpClient) { }

  add(data:any){
    return this.httpClient.post(this.url + '/product/add', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  update(data:any){
    return this.httpClient.post(this.url + '/product/update', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getProducts(){
    return this.httpClient.get(this.url + '/product/get');
  }
  
  delete(id:any){
    return this.httpClient.post(this.url + '/product/delete/' + id, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  updateStatus(data:any){
    return this.httpClient.post(this.url + '/product/updateStatus', data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getById(id:any){
    return this.httpClient.get(this.url + '/product/getById/' + id);
  }

  getProductsByCategory(id:any){
    return this.httpClient.get(this.url + '/product/getByCategory/' + id);
  }


}
