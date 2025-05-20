import { BillService } from './../../services/bill.service';
import { ProductService } from 'src/app/services/product.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from 'src/app/services/category.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-manage-order',
  templateUrl: './manage-order.component.html',
  styleUrls: ['./manage-order.component.scss']
})
export class ManageOrderComponent implements OnInit {

  displayedColumns: string[] = ['name','category','price','quantity','total','delete']; 
  dataSource:any = [];
  manageOrderForm:any = FormGroup;
  categorys:any = [];
  products:any = [];
  price:any;
  totalAmount:number = 0;
  responseMessage:any;

  constructor(private formBuilder: FormBuilder,
              private categoryService: CategoryService,
              private productService: ProductService,
              private billService: BillService,
              private snackbarService: SnackbarService,
              private ngxService: NgxUiLoaderService) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.getCategorys();
    this.manageOrderForm = this.formBuilder.group({
      name:[null,[Validators.required, Validators.pattern(GlobalConstants.nameRegex)]],
      email:[null,[Validators.required, Validators.pattern(GlobalConstants.emailRegex)]],
      telephone:[null,[Validators.required, Validators.pattern(GlobalConstants.phoneRegex)]],
      paymentMethod:[null,[Validators.required]],
      product:[null,[Validators.required]],
      category:[null,[Validators.required]],
      quantity:[null,[Validators.required]],
      price:[null,[Validators.required]],
      total:[0,[Validators.required]]
    });
  }

  getCategorys() {
    this.categoryService.getFilteredCategorys().subscribe((response:any)=>{ 
      this.ngxService.stop();
      this.categorys = response;
    },(error:any)=>{
      console.log(error);
      if(error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }

      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    });
  }

  getProductsByCategory(value:any) {
    this.productService.getProductsByCategory(value.id).subscribe((response:any)=>{
      this.products = response;
      this.manageOrderForm.controls['price'].setValue('');
      this.manageOrderForm.controls['quantity'].setValue('');
      this.manageOrderForm.controls['total'].setValue(0);
    },(error:any)=>{
      console.log(error);
      if(error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }

      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    });
  }

  getProductDetails(value:any) {
    this.productService.getById(value.id).subscribe((response:any)=>{
      this.price = response.price;
      this.manageOrderForm.controls['price'].setValue(this.price);
      this.manageOrderForm.controls['quantity'].setValue('1');
      this.manageOrderForm.controls['total'].setValue(this.price * 1);
    },(error:any)=>{
      console.log(error);
      if(error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }

      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);      
    });
  }

  setQuantity(value:any) {
    let price = this.manageOrderForm.controls['price'].value;
    let quantity = this.manageOrderForm.controls['quantity'].value;

    if(quantity > 0){
      this.manageOrderForm.controls['total'].setValue(quantity * price);
    } else if(quantity != '') {
      quantity = 1;
      this.manageOrderForm.controls['quantity'].setValue(quantity);
      this.manageOrderForm.controls['total'].setValue(quantity * price);
    }
  }

  validateProductAdd() {
    let quantity = this.manageOrderForm.controls['quantity'].value;
    let total = this.manageOrderForm.controls['total'].value;

    if(total === 0 || total === null || quantity <= 0)
      return true;
    else
      return false;
  }

  validateSubmit() {
    if(this.totalAmount === 0 || 
       this.manageOrderForm.controls['name'].value === null ||
       this.manageOrderForm.controls['email'].value === null ||
       this.manageOrderForm.controls['telephone'].value === null ||
       this.manageOrderForm.controls['paymentMethod'].value === null) 
      return true;
    else
      return false;
  }

  handleAddAction() {
    let formData = this.manageOrderForm.value;
    let productName = this.dataSource.find((e: { id: number }) => e.id === formData.product.id);

    if(productName === undefined){
      this.totalAmount = this.totalAmount + formData.total;

      this.dataSource.push({id : formData.product.id,
                            name : formData.product.name,
                            category : formData.category.name,
                            quantity : formData.quantity,
                            price : formData.price,
                            total : formData.total});
      
      this.dataSource = [...this.dataSource];
      this.snackbarService.openSnackBar(GlobalConstants.productAdded, 'success');
    }
    else
      this.snackbarService.openSnackBar(GlobalConstants.productExistError, GlobalConstants.error);
  }

  handleDeleteAction(value:any,element:any) {
    this.totalAmount = this.totalAmount - element.total;
    this.dataSource.splice(value,1);
    this.dataSource = [...this.dataSource];
  }

  submitAction() {
    var formData = this.manageOrderForm.value;
    var data = {
      name: formData.name,
      email: formData.email,
      telephone: formData.telephone,
      paymentMethod: formData.paymentMethod,
      totalAmount: this.totalAmount.toString(),
      productDetails: JSON.stringify(this.dataSource)
    }

    this.ngxService.start();
    this.billService.generateReport(data).subscribe((response:any)=>{
      this.downloadFile(response?.uuid);
      this.manageOrderForm.reset();
      this.dataSource = [];
      this.totalAmount = 0;
    },(error:any)=>{
      console.log(error);
      if(error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }

      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);      
    });
  }

  downloadFile(fileName: string) {
    let data = {
      uuid: fileName
    }

    this.billService.getPdf(data).subscribe((response:any)=>{
      saveAs(response, fileName + '.pdf');
      this.ngxService.stop();
    });
  }


}
