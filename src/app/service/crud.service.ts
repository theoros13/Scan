import { Injectable } from '@angular/core';
 
import { AngularFirestore } from '@angular/fire/firestore';
import { analytics } from 'firebase';
 
@Injectable({
  providedIn: 'root'
})
export class CrudService {

 
  constructor(
    private firestore: AngularFirestore
  ) { }
 
 
  new_Work(record, user) {
    return this.firestore.collection('Work').add(record).then(resp =>{
      user['id_work'] = resp.id;        
      this.firestore.doc('Utilisateurs/' + record['id_user']).update(user);
    });
  }

  get_user_by_id(userId){
    return this.firestore.doc('Utilisateurs/'+userId).get();
  }

  end_Work(user, id_user){    
    return this.firestore.doc('Work/'+user['id_work']).get().subscribe(resp =>{
      let work = resp.data();
      work['Time_end'] = new Date();
      this.firestore.doc('Work/' + user['id_work']).update(work).then(data =>{
        user['id_work'] = '';
        this.firestore.doc('Utilisateurs/' + id_user).update(user);      
      }).catch(e=>{
        console.error(e);
      });
    });
  }

}