import { CategoryService } from './../../../services/category.service';
import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';


@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  
  onAddCategory = new EventEmitter();
  onEditCategory = new EventEmitter();
  categoryForm:any = FormGroup;
  dialogAction:any = "Add";
  action:any = "Add";
  responseMessage:any;

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData:any,
                                       private FormBuilder: FormBuilder,
                                       private CategoryService: CategoryService,
                                       public dialogRef: MatDialogRef<CategoryComponent>,
                                       private snackbarService: SnackbarService) { }

  ngOnInit(): void {
    this.categoryForm = this.FormBuilder.group({
      name:[null,[Validators.required]]
    });

    if(this.dialogData.action === 'Edit'){
      this.dialogAction = 'Edit';
      this.action = "Update";
      this.categoryForm.patchValue(this.dialogData.data);
    }
  }

  handleSubmit(){
    if(this.dialogAction === 'Edit')
      this.edit();
    else
      this.add();
  }

  add(){
    var formData = this.categoryForm.value;
    var data = {
      name: formData.name
    };

    this.CategoryService.add(data).subscribe((response:any)=>{
      this.dialogRef.close();
      this.onAddCategory.emit();
      this.responseMessage = response.message;
      this.snackbarService.openSnackBar(this.responseMessage, 'success');
    },(error)=>{
      this.dialogRef.close();
      console.error(error);
      if(error.error?.message){
        this.responseMessage = error.error?.message;
      }
      else{
        this.responseMessage = GlobalConstants.genericError;
      }

      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    });
  }

  edit(){
    var formData = this.categoryForm.value;
    var data = {
      id: this.dialogData.data.id,
      name: formData.name
    };

    this.CategoryService.update(data).subscribe((response:any)=>{
      this.dialogRef.close();
      this.onEditCategory.emit();
      this.responseMessage = response.message;
      this.snackbarService.openSnackBar(this.responseMessage, 'success');
    },(error)=>{
      this.dialogRef.close();
      console.error(error);
      if(error.error?.message){
        this.responseMessage = error.error?.message;
      }
      else{
        this.responseMessage = GlobalConstants.genericError;
      }

      this.snackbarService.openSnackBar(this.responseMessage, GlobalConstants.error);
    });
  }

}
