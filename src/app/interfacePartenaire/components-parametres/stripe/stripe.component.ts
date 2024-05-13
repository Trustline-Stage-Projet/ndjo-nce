import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Stripe } from 'src/app/utilitaire/models/parametres';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

declare const google: any;

@Component({
  selector: 'app-stripe',
  templateUrl: './stripe.component.html',
  styleUrls: ['./stripe.component.css']
})
export class StripeComponent implements OnInit {
  successMessage!: string
  modalRef!: NgbModalRef;
  codeVerification: string = '';
  errorMessage: string = '';
  @ViewChild('codeVerificationModal') codeVerificationModal: any;
  @ViewChild('codeVerificationModal2') codeVerificationModal2: any;
  @ViewChild('successModal') successModal!: TemplateRef<any>;
  @ViewChild('updateModal') updateModal!: TemplateRef<any>;
  @ViewChild('confirmationModal') confirmationModal: any;
  showUpdateModal = false;
  form!: FormGroup;
  modalContent: any;
  StripeList: Stripe[] = [];
  isUpdateForm = false;
  StripeData: any;
  id!: number;
  userInfo: any;


  constructor(
    private _parametresService: CrmService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private fb: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      partenaire :['', Validators.required],
      Num_carte_de_credit :['', Validators.required],
      Date_expiration_carte :['', Validators.required],
      CVC_CVV :['', Validators.required],
      titulaire :['', Validators.required],
      Adresse_facturation :['', Validators.required]
    });

  }
  ngOnInit(): void {

    this.getUser();

    this.route.params.subscribe((params) => {
      this.id = +params['id']; // Assurez-vous que 'id' correspond à l'ID de la réservation dans vos routes
    });
    this.isUpdateForm = !!this.id;
    const action = this.route.snapshot.url[0].path;

    if (this.id) {
      if (action === 'updateS') {

        this.updateStripe(this.id);
      }
    }
    if (this.id) {
      this._parametresService.getStripe(this.id).subscribe((data) => {
        this.StripeData = data;
        this.fillFormWithData(data);
      });
    }
  }


  initAutocomplete() {
    // Adresse de départ
    const adresseInput = document.getElementById('Adresse_facturation') as HTMLInputElement;
    const adresseAutocomplete = new google.maps.places.Autocomplete(adresseInput, {
      types: ['geocode', 'establishment']
    });
    adresseAutocomplete.addListener('place_changed', () => {
      const place = adresseAutocomplete.getPlace();
      if (place && place.formatted_address) {
        this.form.patchValue({ adresse: place.formatted_address });
      }
    });


  }


  private fillFormWithData(data: any): void {
    this.form.patchValue({
      partenaire :data.partenaire,
      Num_carte_de_credit :data.Num_carte_de_credit,
      Date_expiration_carte :data.Date_expiration_carte,
      CVC_CVV :data.CVC_CVV,
      titulaire :data.titulaire,
      Adresse_facturation :data.Adresse_facturation
    });
  }

  addStripe() {
    if (this.form.valid) {
      const stripeData = this.form.value;
      this._parametresService.addStripe(stripeData).subscribe(
        (response) => {
          console.log('Données enregistrées avec succès', response);
          this.successMessage = 'Données ont été ajoutées avec succès';
          this.openSuccessModal();
          // Réinitialisez le formulaire après la réussite
          this.form.reset();
        },
        (error) => {
          console.error('Erreur lors de l\'enregistrement des données :', error);
        }
      );
    }
  }

  openSuccessModal() {
    this.modalRef = this.modalService.open(this.successModal, { centered: true });
    this.modalRef.result.then(() => {
      // Réinitialisez le message de succès après la fermeture du modal
      this.successMessage = '';
    }, () => {
      // Réinitialisez le message de succès si le modal est fermé sans clic sur le bouton Fermer
      this.successMessage = '';
    });
  }

  updateStripe(id: number) {
    if (this.id) {
      const stripeData = this.form.value;

      this._parametresService.updateStripe(this.id, stripeData).subscribe(
        data => {
          this.successMessage = 'Données on ete mise a jours avec succès';
          console.log('Les données ont été modifiées', data);
          this.modalService.dismissAll();
          this.openSuccessModal();
        },
        error => {
          console.error('Erreur lors de la mise à jour de l\'entreprise', error);
        }
      );

    }

  }

  getUser() {
    this._parametresService.getUserInfo().subscribe(
      (userData: any) => {
        this.userInfo = userData;

        this._parametresService.partenaireList().subscribe((partners: any[]) => {
          const matchingPartner = partners.find(partner => partner.personne_ptr === userData.user_id);

          if (matchingPartner) {
            const idPartenaire = matchingPartner.id_partenaire;
            this.form.get('partenaire')?.patchValue(idPartenaire);
          }
        });
      },
      (error) => {
        console.error('Erreur', error);
      }
    );
  }

  openConfirmationModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      if (result === 'confirm') {
        this.updateStripe(this.id)
      }
    }, (reason) => {
      // Modal closed without confirming (cancel or backdrop click)
    });
  }
}
