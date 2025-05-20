import { saveAs } from 'file-saver';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BillService } from 'src/app/services/bill.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { ViewBillProductsComponent } from '../dialog/view-bill-products/view-bill-products.component';
import { ConfirmationComponent } from '../dialog/confirmation/confirmation.component';

@Component({
  selector: 'app-view-bill',
  templateUrl: './view-bill.component.html',
  styleUrls: ['./view-bill.component.scss']
})
export class ViewBillComponent implements OnInit {

  displayedColumns: string[] = ['name', 'email', 'telephone', 'paymentMethod', 'total', 'view'];
  dataSource: any;
  responseMessage: any;

  constructor(private router: Router,
              private dialog: MatDialog,          
              private billService: BillService,
              private ngxService: NgxUiLoaderService,
              private snackbarService: SnackbarService) { }

  ngOnInit() {
    this.ngxService.start();
    this.tableData();
  }

  tableData(){
    this.billService.getBills().subscribe((response:any)=>{
      this.ngxService.stop();
      this.dataSource = new MatTableDataSource(response);
    },(error:any)=>{
      this.ngxService.stop();
      console.log(error);

      if(error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }

      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);      
    });
  }

  applyFilter(event:Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLocaleLowerCase();
  }

  handleViewAction(values:any){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      data:values
    }

    dialogConfig.width = '100%';
    const dialogRef = this.dialog.open(ViewBillProductsComponent, dialogConfig);

    this.router.events.subscribe(()=>{
      dialogRef.close();
    });
  }

  handleDeleteAction(values:any){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'delete ' + values.name + ' bill',
      confirmation:true
    };

    const dialogRef = this.dialog.open(ConfirmationComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((response)=>{
      this.ngxService.start();
      this.deleteBill(values.id);
      dialogRef.close();
    });
  }

  deleteBill(id:any){
    this.billService.delete(id).subscribe((response:any)=>{
      this.ngxService.stop();
      this.tableData();
      this.responseMessage = response?.message;
      this.snackbarService.openSnackBar(this.responseMessage, 'success');
    },(error:any)=>{
      this.ngxService.stop();
      console.log(error);

      if(error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = GlobalConstants.genericError;
      }

      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);         
    });
  }

  downloadBillAction(values:any){
    this.ngxService.start();
    var data = {
      name: values.name,
      email: values.email,
      uuid: values.uuid,
      telephone: values.telephone,
      paymentMethod: values.paymentMethod,
      totalAmount: values.total.toString(),
      productDetails: values.productDetail
    }

    let fileName = values.uuid + '.pdf';
    
    this.billService.getPdf(data).subscribe((response:any)=>{
      saveAs(response, fileName);
      this.ngxService.stop();
    });
  }
}