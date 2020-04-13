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
          'Photo_start' : "",
          'Time_end' : '',
          'Photo_end' : ""
        }
        this.crudService.new_Work(this.Work, this.User).then(resp => { 
          this.StartToast() 
        });
      }else{
        this.crudService.end_Work(this.User, this.textScanned);
        this.EndToast() 
      }
     }); 

    
  }

  test(){    
    this.textScanned = 'hqYwU6PIOu26wELVg8Hg';
    this.set_work();  
  }

  scanCode() {
    this.showCamera = true;
    // Optionally request the permission early
    this.qrScanner.prepare()
    .then((status: QRScannerStatus) => {
      if (status.authorized) {
        // start scanning
        const scanSub = this.qrScanner.scan().subscribe((text: string) => {

          

          this.textScanned = text;
          this.qrScanner.hide(); // hide camera preview
          scanSub.unsubscribe(); // stop scanning
          this.showCamera = false;
          this.capture();
          this.set_work();

        });
      } else if (status.denied) {
        this.cameraAvailable = false;
      } else {
        // permission was denied, but not permanently. You can ask for permission again at a later time.
      }
    })
    .catch((e: any) => console.log('Error is', e));
  }

  closeCamera() {
    this.showCamera = false;
    this.qrScanner.hide(); // hide camera preview
    this.qrScanner.destroy();
  }

  async testToast(t:string) {
    
    const toast = await this.toastController.create({
        message: t,
        color : 'warnig',
        duration: 3000
      });
    toast.present();
  }

  async StartToast() {
    
    const toast = await this.toastController.create({
        message: 'Debut du service',
        color : 'success',
        duration: 2000
      });
    toast.present();
  }

  async EndToast() {
    
    const toast = await this.toastController.create({
        message: 'Fin du service',
        color : 'tertiary',
        duration: 2000
      });
    toast.present();
  }


  capture() {
    const cameraOptions: CameraOptions = {
      quality: 50,
      cameraDirection: this.camera.Direction.FRONT,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
      correctOrientation: true
    };

    this.camera.getPicture(cameraOptions)
      .then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
		
        this.captureDataUrl = 'data:image/jpeg;base64,' + imageData;
      }, (err) => {
	  
    });
  } // End of capture camera


  upload() {
    let storageRef = firebase.storage().ref();
    var imageRef;
    var date = new Date();
    var datetostring = date.getFullYear().toString() + '/' + date.getUTCMonth().toString() + '/' + date.getDate().toString();
    if(this.User['id_work']){
      imageRef = storageRef.child(this.User['nom'] + '-' + this.User['prenom'] + '/' + datetostring + '/start.jpg');
    }else{
      imageRef = storageRef.child(this.User['nom'] + '-' + this.User['prenom'] + '/' + datetostring + '/end.jpg');
    }
    imageRef.putString(this.captureDataUrl, firebase.storage.StringFormat.DATA_URL)
      .then((snapshot)=> {
        this.captureDataUrl = "";
      }).catch((err)=>{
        this.testToast(err);
      });
  }

}
