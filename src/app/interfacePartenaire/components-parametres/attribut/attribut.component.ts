import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Entreprise } from 'src/app/utilitaire/models/gve';
import { Attribut } from 'src/app/utilitaire/models/parametres';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-attribut',
  templateUrl: './attribut.component.html',
  styleUrls: ['./attribut.component.css']
})
export class AttributComponent implements OnInit {
  entrepriseList: any[] = [];
  userInfo: any;
  successMessage!: string
  modalRef!: NgbModalRef;
  data: any;
  codeVerification: string = '';
  errorMessage: string = '';
  @ViewChild('codeVerificationModal') codeVerificationModal: any;
  @ViewChild('codeVerificationModal2') codeVerificationModal2: any;
  @ViewChild('successModal') successModal!: TemplateRef<any>;
  @ViewChild('updateModal') updateModal!: TemplateRef<any>;
  @ViewChild('confirmationModal') confirmationModal: any;
  showUpdateModal = false;
  updateForm!: FormGroup;
  modalContent: any;
  attributList: Attribut[] = [];
  isUpdateForm = false;
  attributData: any;
  id!: number

  constructor(
    private _parametresService: CrmService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) {
    this.updateForm = this.fb.group({
      entreprise: ['', Validators.required],
      nom_attribut: ['', Validators.required],
      prix_unitaire_attribut: ['', Validators.required],
      nombre_maximum: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.id = +params['id']; // Assurez-vous que 'id' correspond à l'ID de la réservation dans vos routes
    });
    this.isUpdateForm = !!this.id;

    this.getUser();

    const action = this.route.snapshot.url[0].path;
    if (this.id) {
      if (action === 'updateAttr') {
        this.updateAttr(this.id);
      }
    }
    if (this.id) {
      this._parametresService.getAttribut(this.id).subscribe((data) => {
        this.attributData = data;
        this.updateForm = this.fb.group({
          nom_attribut: [this.attributData.nom_attribut],
          prix_unitaire_attribut: [this.attributData.prix_unitaire_attribut],
          nombre_maximum: [this.attributData.nombre_maximum],
          entreprise: [this.attributData.entreprise],
        });
      });
    }
  }

  form = new FormGroup({
    entreprise:new FormControl('', Validators.required),
    nom_attribut: new FormControl('', Validators.required),
    prix_unitaire_attribut: new FormControl('', Validators.required),
    nombre_maximum: new FormControl('', Validators.required),
  })



  getUser() {
    this._parametresService.getUserInfo().subscribe(
      (userData: any) => {
        this.userInfo = userData;
  
        this._parametresService.partenaireList().subscribe((partners: any[]) => {
          const matchingPartner = partners.find(partner => partner.personne_ptr === userData.user_id);
  
          if (matchingPartner) {
            const idPartenaire = matchingPartner.id_partenaire;
  
            this._parametresService.getEntreprisesPartenaire().subscribe((entrepriseData: any) => {
              this.userInfo = entrepriseData.find((entreprise: { partenaire: any; }) => entreprise.partenaire === idPartenaire);
              if (this.userInfo) {
                // Pré-remplir le champ entreprise avec l'ID récupéré
                this.form.get('entreprise')?.patchValue(this.userInfo.id);
              }
            });
          }


        });
      },
      (error) => {
        console.error('Erreur', error);
      }
    );
  }
 
  addAttribut() {
    this.data = this.form.value;

    this._parametresService.addAttribut(this.data).subscribe(
      () => {

        this.successMessage = 'Données enregistrer dans la base de données avec succès';
        // Afficher le modal avec le message de succès
        console.log(this.successMessage);
        this.openSuccessModal();

      },
      (error) => {

        console.log('Erreur lors de l\'enregistrement des données : ' + error.message);
        this.successMessage = 'Erreur lors de l\'enregistrement des données : ' + error.message;
        // Afficher le modal avec le message de succès
        console.log(this.successMessage);
      }
    );
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

  updateAttr(id: number) {
    this.data = this.updateForm.value; // Récupérer les données du formulaire de mise à jour

    if (this.id) {
      this._parametresService.updateAttribut(this.id, this.data).subscribe(
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
        this.updateAttr(this.id)
      }
    }, (reason) => {
      // Modal closed without confirming (cancel or backdrop click)
    });
  }


}

