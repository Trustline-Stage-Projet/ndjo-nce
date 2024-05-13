import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Entreprise } from 'src/app/utilitaire/models/gve';
import { TypeVehicule } from 'src/app/utilitaire/models/parametres';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-type-vehicule',
  templateUrl: './type-vehicule.component.html',
  styleUrls: ['./type-vehicule.component.css']
})
export class TypeVehiculeComponent implements OnInit {
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
  typeVehiculeList: TypeVehicule[] = [];
  isUpdateForm = false;
  TypeVehiculeData: any;
  id!: number
  constructor(
    private _parametresService: CrmService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private fb: FormBuilder,
  ) {
    this.updateForm = this.formBuilder.group({
      nom_type: ['', Validators.required],
      description: ['', Validators.required],
      entreprise: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.id = +params['id']; // Assurez-vous que 'id' correspond à l'ID de la réservation dans vos routes
    });
    this.isUpdateForm = !!this.id;
    const action = this.route.snapshot.url[0].path;

    this.getUser();

    if (this.id) {
      if (action === 'updateTypeVehicule') {
        // L'action est une modification, effectuez la modification ici
        this.updateTypeVehicule(this.id);
      } 
    }
    if (this.id) {
          this._parametresService.getTypeVehicule(this.id).subscribe((data) => {
        this.TypeVehiculeData = data;
        this.updateForm = this.fb.group({
          nom_type: [this.TypeVehiculeData.nom_type],
          description: [this.TypeVehiculeData.description],
          entreprise: [this.TypeVehiculeData.entreprise],
        });
      });
    }
  }

  form = new FormGroup({
    nom_type: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    entreprise:new FormControl('', Validators.required),

  })

  // getUser() {
  //   this._parametresService.getUserInfo().subscribe(
  //     (data) => {
  //       this.userInfo = data;
  //       this.getEntreprise();
        
  //     },
  //     (error) => {
  //       console.error('erreur', error)
  //     }
  //   );
  // }
  // getEntreprise(): void {
  //   this._parametresService.getEntreprises().subscribe((data: Entreprise[]) => {
  //     // Filtrer les entreprises par type "Mon_Entreprise" et utilisateur connecté
  //     this.entrepriseList = data.filter((entreprise) => {
  //       return entreprise.utilisateur === this.userInfo.user_id;
  //     });
  //   });
  // }
  

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

  addTypeVehicule() {
    this.data = this.form.value;
    this._parametresService.addTypeVehicule(this.data).subscribe(
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
        this.openSuccessModal();
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

  openConfirmationModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      if (result === 'confirm') {
        this.updateTypeVehicule(this.id)
      }
    }, (reason) => {
      // Modal closed without confirming (cancel or backdrop click)
    });
  }

  updateTypeVehicule(id: number) {
    this.data = this.updateForm.value; // Récupérer les données du formulaire de mise à jour

    if (this.id) {
      this._parametresService.updateTypeVehicule(this.id, this.data).subscribe(
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


  openCodeVerificationModal2() {
    this.modalService.open(this.codeVerificationModal2, { centered: true, backdrop: 'static', keyboard: false }); // Ouvrir le modal de vérification du code
  }

  // verifyCode2() {
  //   this._parametresService.getAllCodeVerification().subscribe(
  //     (response) => {
  //       // Vérifiez d'abord si la réponse contient au moins un élément
  //       if (response.length > 0) {
  //         const passStandard = response[0].pass_standard;
 
          
  //         if (this.codeVerification === passStandard || '000000') {
  //           this.errorMessage = '';
            
  //         } else {
  //           this.errorMessage = 'Code d\'authentification incorrect. Veuillez réessayer.';
  //         }
  //       } else {
  //         this.errorMessage = 'Aucun code d\'authentification trouvé.';
  //       }
  //     },
  //     (error) => {
  //       console.error('Erreur lors de la récupération des codes de vérification :', error);
  //     }
  //   );
  // }


}
