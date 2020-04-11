import { Component } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { CrudService } from './../service/crud.service';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

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

  constructor(
    private qrScanner: QRScanner,
    private crudService: CrudService, 
    private diagnostic: Diagnostic,
    public alertController: AlertController,
    public toastController: ToastController
  ) { }

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

}
