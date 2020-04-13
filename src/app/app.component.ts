import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
    
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      const firebaseConfig = {
        apiKey: "AIzaSyCNPjvhPkkWHH8QNJSVUb7-BigTpmYU_GE",
        authDomain: "scantime-8b591.firebaseapp.com",
        databaseURL: "https://scantime-8b591.firebaseio.com",
        projectId: "scantime-8b591",
        storageBucket: "scantime-8b591.appspot.com",
        messagingSenderId: "13431367727",
        appId: "1:13431367727:web:86f3115bf72acd646efeda",
        measurementId: "G-TXSHHWLGZ9"
      };
      
      firebase.initializeApp(firebaseConfig);
    });
  }
}
