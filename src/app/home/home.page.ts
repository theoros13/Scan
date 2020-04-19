import { Component } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { CrudService } from './../service/crud.service';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import * as firebase from 'firebase';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  cameraAvailable:boolean = false;
  public showCamera = false;
  public textScanned: string = '';
  Work:any;
  User:any;
  captureDataUrl: string;
  private texttoast:string ="";

  constructor(
    private qrScanner: QRScanner,
    private crudService: CrudService, 
    private diagnostic: Diagnostic,
    public alertController: AlertController,
    public toastController: ToastController,
    private camera: Camera,
  ) { 
  }
  async ngOnInit() {
    const alert = await this.alertController.create({
      header: 'Error camera',
      message: 'La camera n\'est pas disponible',
      buttons: [
        {
          text: 'ok'
        }
      ]
    });
    this.diagnostic.isCameraPresent().then(
      (isAvailable : any) => {
        this.cameraAvailable = true;
      }
    ).catch(async (error:any)=>{
      console.dir("Camera is: " + error);
      await alert.present();
    });
  }
  set_work(){
    this.crudService.get_user_by_id(this.textScanned).subscribe(resp => {
      this.User = resp.data();
      if(!this.User['id_work']){
        this.Work = {
          'id_user' : this.textScanned,
          'Time_start' : new Date(),
          'Time_end' : '',
        }
        this.crudService.new_Work(this.Work, this.User).then(resp => { 
          this.texttoast = "Debut de service"
        });
      }else{
        this.crudService.end_Work(this.User, this.textScanned);
        this.texttoast = "Fin de service"
      }
     }); 
  }
  scanCode() {
    this.showCamera = true;
        const scanSub = this.qrScanner.scan().subscribe((text: string) => {
          this.textScanned = text;
          this.qrScanner.hide(); // hide camera preview
          scanSub.unsubscribe(); // stop scanning
          this.showCamera = false;
          this.capture();          
          this.set_work();
        });
  }
  closeCamera() {
    this.showCamera = false;
    this.qrScanner.hide(); // hide camera preview
    this.qrScanner.destroy();
  }
  async UploadToast(t:string ) {
    const toast = await this.toastController.create({
        message: t + " - Photo bien evoyer",
        color : 'success',
        duration: 2000
      });
      toast.present();
  }
  async UploadToastError() {
    const toast = await this.toastController.create({
        message: "Aucune photo a etait envoyée",
        color : 'error',
        duration: 2000
      });
    toast.present();
  }
  capture() {
    const cameraOptions: CameraOptions = {
      quality: 30,
      cameraDirection: 1,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
      correctOrientation: true
    };
    this.camera.getPicture(cameraOptions)
      .then((imageData) => {
        this.captureDataUrl = 'data:image/jpeg;base64,' + imageData;
        this.upload();
      }, (err) => {
	  
    });
  }
  upload() {
    let storageRef = firebase.storage().ref();
    var imageRef;
    var date = new Date();
    var datetostring = date.getFullYear().toString() + '/' + date.getMonth().toString() + '/' + date.getDate().toString();
    
    imageRef = storageRef.child(this.User["campagne"] + "/" + this.User['nom'] + '-' + this.User['prenom'] + '/' + datetostring + '/'+ date.getHours().toString() + ':'+ date.getMinutes().toString() + ':' + date.getSeconds().toString() +'.jpg');

    imageRef.putString(this.captureDataUrl, firebase.storage.StringFormat.DATA_URL)
      .then((snapshot)=> {
        this.UploadToast(this.texttoast);
        this.captureDataUrl = "";
      }).catch((err)=>{
        this.UploadToastError();
      });
  }
}
