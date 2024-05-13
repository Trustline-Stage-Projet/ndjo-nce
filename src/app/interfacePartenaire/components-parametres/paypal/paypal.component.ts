import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PayPal } from 'src/app/utilitaire/models/parametres';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.css']
})
export class PaypalComponent implements OnInit {
  logoPreview: string | null = null;
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
  Updateform!:FormGroup;
  modalContent: any;
  paypalList: PayPal[] = [];
  isUpdateForm = false;
  PaypalData: any;
  id!: number;
  userInfo: any;

  constructor(
    private _parametresService: CrmService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private fb: FormBuilder,
  ) {
    this.Updateform = this.formBuilder.group({
      email: ['', Validators.email],
      nom_associer:['', Validators.required],
      partenaire:['', Validators.required],
    });

    this.form = this.formBuilder.group({
      email: ['', Validators.email],
      nom_associer:['', Validators.required],
      partenaire:['', Validators.required],
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
      if (action === 'updateP') {

        this.updatePaypal(this.id);
      }
    }
    if (this.id) {
      this._parametresService.getPaypal(this.id).subscribe((data) => {
        this.PaypalData = data;
        this.fillFormWithData(data);
      });
    }
  }

  private fillFormWithData(data: any): void {
    this.Updateform.patchValue({
      email: data.email,
      nom_associer : data.nom_associer,
      partenaire : data.partenaire
    });
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

  addPaypal() {
    if (this.form.valid) {
      const paypalData = this.form.value;
      this._parametresService.addPaypal(paypalData).subscribe(
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


  updatePaypal(id: number) {
      if (this.id) {
      const paypalData = this.Updateform.value;
      this._parametresService.updatePayPal(this.id, paypalData).subscribe(
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
      } else {
        // Gérer le cas où l'ID n'est pas présent dans l'URL
        console.log('ID introuvable dans l\'URL.');
      }
  }

  openConfirmationModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      if (result === 'confirm') {
        this.updatePaypal(this.id)
      }
    }, (reason) => {
      // Modal closed without confirming (cancel or backdrop click)
    });
  }

}
