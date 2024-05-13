import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Entreprise } from 'src/app/utilitaire/models/gve';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

declare const google: any;

@Component({
  selector: 'app-update-entreprise',
  templateUrl: './update-entreprise.component.html',
  styleUrls: ['./update-entreprise.component.css']
})
export class UpdateEntrepriseComponent implements OnInit {
  entrepriseForm: FormGroup;
  Id!: number;
  logoPreview: string | null = null;
  entreprise: Entreprise = new Entreprise();
  modalRef!: NgbModalRef;
  @ViewChild('successModal') successModal!: TemplateRef<any>; // Référence à l'élément ng-template
  successMessage!: string
  previousLogo: string | null = null;
  ancienCheminImage: string | null = null;
  modifierLogo: boolean = false;
  userInfo: any


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _modalService: NgbModal,
    private router: Router,
    private _gveService: CrmService
  ) {
    this.entrepriseForm = this.fb.group({
      nom: [''],
      utilisateur: [''],
      adresse: [''],
      email: [''],
      telephone: [''],
      site_web: [''],
      description: [''],
      date_ajout:[''],
      logo: [null],
      pays_operation: [''],
      ville_operation: [''],
      nom_DG  :[''],
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
    this.route.params.subscribe((params) => {
      this.Id = +params['id'];
      this._gveService.getEntrepriseDetail(this.Id).subscribe((data) => {
        this.entreprise = data;
        this.fillFormWithData(data);
      });
    });
  }


  private fillFormWithData(data: any): void {
    this.ancienCheminImage = data.logo;
    this.entrepriseForm.patchValue({
      nom: data.nom,
      utilisateur: data.utilisateur,
      adresse: data.adresse,
      email: data.email,
      telephone: data.telephone,
      date_ajout: new Date(),
      site_web: data.site_web,
      description: data.description,
      pays_operation: data.pays_operation,
      ville_operation: data.ville_operation,
      nom_DG: data.nom_DG,
      contact_DG : data.contact_DG,
      email_DG : data.email_DG,
      nom_Dr_des_Finances : data.nom_Dr_des_Finances,
      contact_Dr_des_Finances :data.contact_Dr_des_Finances,
      email_Dr_des_Finances : data.email_Dr_des_Finances,
      nom_Chargé_de_la_clientèle :data.nom_Chargé_de_la_clientèle,
      contact_Chargé_de_la_clientèle : data.contact_Chargé_de_la_clientèle,
      email_Chargé_de_la_clientèle : data.email_Chargé_de_la_clientèle,
    });
  }

  private getLogoPreview(logo: File | null): void {
    if (logo instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        this.ancienCheminImage = '';
        this.logoPreview = reader.result as string;
      };
      reader.readAsDataURL(logo);
    } else {
      this.logoPreview = null; // Définissez logoPreview sur null si le logo est null
    }
  }


  getUser() {
    this._gveService.getUserInfo().subscribe(
      (userData: any) => {
        this.userInfo = userData;
        console.log(userData);
      },
      (error) => {
        console.error('Erreur', error);
      }
    );
  }

  onSubmit() {
    if (this.entrepriseForm.valid) {
      const entrepriseData = new FormData();

      // Ajoutez les champs de texte au FormData
      entrepriseData.append('nom', this.entrepriseForm.get('nom')!.value);
      entrepriseData.append('adresse', this.entrepriseForm.get('adresse')!.value);
      entrepriseData.append('email', this.entrepriseForm.get('email')!.value);
      entrepriseData.append('telephone', this.entrepriseForm.get('telephone')!.value);
      entrepriseData.append('site_web', this.entrepriseForm.get('site_web')!.value);
      entrepriseData.append('description', this.entrepriseForm.get('description')!.value);
      entrepriseData.append('pays_operation', this.entrepriseForm.get('pays_operation')!.value);
      entrepriseData.append('ville_operation', this.entrepriseForm.get('ville_operation')!.value);
      entrepriseData.append('nom_DG', this.entrepriseForm.get('nom_DG')?.value || '');
      entrepriseData.append('contact_DG', this.entrepriseForm.get('contact_DG')?.value || '');
      entrepriseData.append('email_DG', this.entrepriseForm.get('email_DG')?.value || '');
      entrepriseData.append('nom_Dr_des_Finances', this.entrepriseForm.get('nom_Dr_des_Finances')?.value || '');
      entrepriseData.append('contact_Dr_des_Finances', this.entrepriseForm.get('contact_Dr_des_Finances')?.value || '');
      entrepriseData.append('email_Dr_des_Finances', this.entrepriseForm.get('email_Dr_des_Finances')?.value || '');
      entrepriseData.append('nom_Chargé_de_la_clientèle', this.entrepriseForm.get('nom_Chargé_de_la_clientèle')?.value || '');
      entrepriseData.append('contact_Chargé_de_la_clientèle', this.entrepriseForm.get('contact_Chargé_de_la_clientèle')?.value || '');
      entrepriseData.append('email_Chargé_de_la_clientèle', this.entrepriseForm.get('email_Chargé_de_la_clientèle')?.value || '');
      entrepriseData.append('date_ajout', this.entrepriseForm.get('date_ajout')!.value);
      entrepriseData.append('utilisateur', this.entrepriseForm.get('utilisateur')!.value);

      const logo = this.entrepriseForm.get('logo')?.value;
      if (logo) {
        entrepriseData.append('logo', logo);
      }

      this._gveService.updateEntreprise(this.Id, entrepriseData).subscribe(
        data => {
          this.successMessage = 'Données on ete mise a jours avec succès';
          console.log('Les données ont été modifiées', data);
          this.openSuccessModal();
        },
        error => {
          console.error('Erreur lors de la mise à jour de l\'entreprise', error);
        }
      );
    }else{
      this.successMessage = 'Veuillez remplir correctement tous les champs du formulaire et réessayer. Merci!';
      this.openSuccessModal();
    }
  }


  onLogoChange(event: any) {
    // Vous pouvez utiliser le point d'interrogation ici aussi pour éviter une erreur si le formulaire est null
    const logoControl = this.entrepriseForm.get('logo');
    if (logoControl) {
      logoControl.setValue(event.target.files[0]);
      this.getLogoPreview(event.target.files[0]); // Mettez à jour l'aperçu du logo lorsque le fichier change
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

  // supprimer une reservation
  delete(): void {
    if (this.entreprise && this.Id) {
      this._gveService.deleteEntreprise(this.Id).subscribe({
        next: (res) => {
          console.log(res, 'Entreprise supprimer avec succes');

          this.router.navigate(['/listEntreprise']);
        },
        error: (e) => console.error(e)
      });
    } else {
      console.error('Impossible de supprimer l Entreprise : ID non valide');
    }
  }


  openConfirmationModal(content: any) {
    this._modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      if (result === 'confirm') {
        this.delete();
      }
    }, (reason) => {
      // Modal closed without confirming (cancel or backdrop click)
    });
  }

  openConfirmation(content: any) {
    this._modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      if (result === 'confirm') {
        this.onSubmit();
      }
    }, (reason) => {
      // Modal closed without confirming (cancel or backdrop click)
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
