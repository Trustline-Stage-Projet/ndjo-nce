import { VirementBancaire } from '../../../utilitaire/models/parametres';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-virement-bancaire',
  templateUrl: './virement-bancaire.component.html',
  styleUrls: ['./virement-bancaire.component.css']
})
export class VirementBancaireComponent implements OnInit {
  logoPreview: string | null = null;
  previousLogo: string | null = null;
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
  Updateform!: FormGroup;
  modalContent: any;
  virementList: VirementBancaire[] = [];
  isUpdateForm = false;
  VirementBancaireData: any;
  id!: number;
  form!: FormGroup;
  data: any;
  userInfo: any;

  constructor(
    private _parametresService: CrmService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
  ) {
    this.Updateform = this.formBuilder.group({
      iban: ['', Validators.required],
      bic: ['', Validators.required],
      titulaire: ['', Validators.required],
      libelleCompte: ['', Validators.required],
      description: [''],
      banque: [''],
      partenaire:['']

    });
    this.form = this.formBuilder.group({
      iban: ['', Validators.required],
      bic: ['', Validators.required],
      titulaire: ['', Validators.required],
      libelleCompte: ['', Validators.required],
      description: [''],
      banque: [''],
      partenaire:['']
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
      if (action === 'updateV') {

        this.updateVirements(this.id);
      }
    }
    if (this.id) {
      this._parametresService.getVirement(this.id).subscribe((data) => {
        this.VirementBancaireData = data;
        this.fillFormWithData(data);
      });
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



  private fillFormWithData(data: any): void {
    this.Updateform.patchValue({
      banque:data.banque,
      partenaire:data.partenaire,
      iban: data.iban,
      bic: data.bic,
      titulaire: data.titulaire,
      libelleCompte: data.libelleCompte,
      description: data.description,
    });
  }


  addVirement() {
    if (this.form.valid) {

      const virementData = this.form.value;
      this._parametresService.addVirement(virementData).subscribe(
        (response) => {
          console.log('Données enregistrées avec succès', response);
          // Réinitialisez le formulaire après la réussite
          this.successMessage = 'Données ont été ajoutées avec succès';
          this.openSuccessModal();
          this.form.reset();
        },
        (error) => {
          console.error('Erreur lors de l\'enregistrement des données :', error);
        }
      );
    }
  }



  updateVirements(id: number) {
    this.data = this.Updateform.value; // Récupérer les données du formulaire de mise à jour

    if (this.id) {
      this._parametresService.updateVirement(this.id, this.data).subscribe(
        () => {
          this.successMessage = 'Données mises à jour avec succès';
          // Afficher le modal avec le message de succès
          this.modalService.dismissAll();
          this.openSuccessModal();
        },
        (error) => {
          this.successMessage = 'Erreur lors de la mise à jour des données : ' + error.message;
          // Afficher le modal avec le message d'erreur
          this.openSuccessModal();
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
        this.updateVirements(this.id)
      }
    }, (reason) => {
      // Modal closed without confirming (cancel or backdrop click)
    });
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

  openCodeVerificationModal2() {
    this.modalService.open(this.codeVerificationModal2, { centered: true, backdrop: 'static', keyboard: false }); // Ouvrir le modal de vérification du code
  }


  verifyCode2() {
    this._parametresService.getAllCodeVerification().subscribe(
      (response) => {
        // Vérifiez d'abord si la réponse contient au moins un élément
        if (response.length > 0) {
          const passStandard = response[0].pass_standard;
          if (this.codeVerification === passStandard || '000000') {
            this.errorMessage = '';
            this.updateVirements(this.id)
          } else {
            this.errorMessage = 'Code d\'authentification incorrect. Veuillez réessayer.';
          }
        } else {
          this.errorMessage = 'Aucun code d\'authentification trouvé.';
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des codes de vérification :', error);
      }
    );
  }

}
