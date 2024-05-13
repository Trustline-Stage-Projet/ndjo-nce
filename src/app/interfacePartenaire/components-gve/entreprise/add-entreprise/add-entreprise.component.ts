import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

declare const google: any;

@Component({
  selector: 'app-add-entreprise',
  templateUrl: './add-entreprise.component.html',
  styleUrls: ['./add-entreprise.component.css']
})
export class AddEntrepriseComponent {
  successMessage!: string
  modalRef!: NgbModalRef;
  @ViewChild('successModal') successModal!: TemplateRef<any>; // Référence à l'élément ng-template
  entrepriseForm!: FormGroup;
  userInfo: any;

  constructor(private _modalService: NgbModal,
    private _gveService: CrmService, private router: Router, private fb: FormBuilder,) {
    this.entrepriseForm = this.fb.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      site_web: [''],
      date_ajout: ['', Validators.required],
      description: [''],
      logo: [null],
      pays_operation: ['', Validators.required],
      ville_operation: ['', Validators.required],
      nom_DG  :['', Validators.required],
      contact_DG :[''],
      email_DG : [''],
      nom_Dr_des_Finances : [''],
      contact_Dr_des_Finances :[''],
      email_Dr_des_Finances : [''],
      nom_Chargé_de_la_clientèle :[''],
      contact_Chargé_de_la_clientèle : [''],
      email_Chargé_de_la_clientèle : [''],
      
    });
  }

  ngOnInit(): void {
    this.initAutocomplete();
    this. getUser()
  }

  getUser(){
    this._gveService.getUserInfo().subscribe(
      (data) => {
        this.userInfo = data;
      },
      (error) => {
        console.error('erreur',error)
      }
    );
   }
  

  addEntreprise() {
    if (this.entrepriseForm.valid) {
      const formData = new FormData();
      // Utilisez la syntaxe '?.' pour accéder aux valeurs en toute sécurité
      formData.append('nom', this.entrepriseForm.get('nom')?.value || '');
      formData.append('adresse', this.entrepriseForm.get('adresse')?.value || '');
      formData.append('email', this.entrepriseForm.get('email')?.value || '');
      formData.append('telephone', this.entrepriseForm.get('telephone')?.value || '');
      formData.append('site_web', this.entrepriseForm.get('site_web')?.value || '');
      formData.append('date_ajout', this.entrepriseForm.get('date_ajout')?.value || '');
      formData.append('description', this.entrepriseForm.get('description')?.value || '');
      formData.append('utilisateur', this.userInfo.user_id);
      const logo = this.entrepriseForm.get('logo')?.value;
      if (logo) {
        formData.append('logo', logo);
      }

      formData.append('pays_operation', this.entrepriseForm.get('pays_operation')?.value || '');
      formData.append('ville_operation', this.entrepriseForm.get('ville_operation')?.value || '');
     
      formData.append('nom_DG', this.entrepriseForm.get('nom_DG')?.value || '');
      formData.append('contact_DG', this.entrepriseForm.get('contact_DG')?.value || '');
      formData.append('email_DG', this.entrepriseForm.get('email_DG')?.value || '');
      formData.append('nom_Dr_des_Finances', this.entrepriseForm.get('nom_Dr_des_Finances')?.value || '');
      formData.append('contact_Dr_des_Finances', this.entrepriseForm.get('contact_Dr_des_Finances')?.value || '');
      formData.append('email_Dr_des_Finances', this.entrepriseForm.get('email_Dr_des_Finances')?.value || '');
      formData.append('nom_Chargé_de_la_clientèle', this.entrepriseForm.get('nom_Chargé_de_la_clientèle')?.value || '');
      formData.append('contact_Chargé_de_la_clientèle', this.entrepriseForm.get('contact_Chargé_de_la_clientèle')?.value || '');
      formData.append('email_Chargé_de_la_clientèle', this.entrepriseForm.get('email_Chargé_de_la_clientèle')?.value || '');

      // Now you can send formData to your service
      this._gveService.createEntreprise(formData).subscribe(
        (response) => {
          // Handle the response here
           this.successMessage = 'Données ont été ajoutées avec succès';
          this.openSuccessModal();
        },
        (error) => {
          // Handle errors here
          console.error(error);
        }
      );
    }
  }


  onLogoChange(event: any) {
    // Vous pouvez utiliser le point d'interrogation ici aussi pour éviter une erreur si le formulaire est null
    const logoControl = this.entrepriseForm.get('logo');
    if (logoControl) {
      logoControl.setValue(event.target.files[0]);
    }
  }


  openSuccessModal() {
    this.modalRef = this._modalService.open(this.successModal, { centered: true });
    this.modalRef.result.then(() => {
      // Réinitialisez le message de succès après la fermeture du modal
      this.successMessage = '';
    }, () => {
      // Réinitialisez le message de succès si le modal est fermé sans clic sur le bouton Fermer
      this.successMessage = '';
    });
  }

  initAutocomplete() {
    // Adresse de départ
    const adresseInput = document.getElementById('adresse') as HTMLInputElement;
    const adresseAutocomplete = new google.maps.places.Autocomplete(adresseInput, {
      types: ['geocode', 'establishment']
    });
    adresseAutocomplete.addListener('place_changed', () => {
      const place = adresseAutocomplete.getPlace();
      if (place && place.formatted_address) {
        this.entrepriseForm.patchValue({ adresse: place.formatted_address });
      }
    });

    // Adresse d'arrivée
    const paysOperationInput = document.getElementById('pays_operation') as HTMLInputElement;
    const paysOperationAutocomplete = new google.maps.places.Autocomplete(paysOperationInput, {
      types: ['geocode', 'establishment']
    });
    paysOperationAutocomplete.addListener('place_changed', () => {
      const place = paysOperationAutocomplete.getPlace();
      if (place && place.formatted_address) {
        this.entrepriseForm.patchValue({ pays_operation: place.formatted_address });
      }
    });

    // Adresse d'arrivée
    const villeOperationInput = document.getElementById('ville_operation') as HTMLInputElement;
    const villeOperationAutocomplete = new google.maps.places.Autocomplete(villeOperationInput, {
      types: ['geocode', 'establishment']
    });
    villeOperationAutocomplete.addListener('place_changed', () => {
      const place = villeOperationAutocomplete.getPlace();
      if (place && place.formatted_address) {
        this.entrepriseForm.patchValue({ ville_operation: place.formatted_address });
      }
    });

  }



}
