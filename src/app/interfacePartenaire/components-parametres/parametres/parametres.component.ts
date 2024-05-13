import { Attribut, AutrePayement, CleAPI, Compteur, ConfigDevis, ConfigFacture, ConfigurationDeBase, InfoUser, MethodePayement, TypeVehicule } from '../../../utilitaire/models/parametres';
import { Parametres } from '../../../utilitaire/models/parametres';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CrmService } from 'src/app/utilitaire/services/crm.service';
import { Entreprise } from 'src/app/utilitaire/models/gve';

@Component({
  selector: 'app-parametres',
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.css']
})
export class ParametresComponent implements OnInit {
  attributList: Attribut[] = [];
  typeVehiculeList: TypeVehicule[] = [];
  stripeList: any[] = [];
  paypalList: any[] = [];
  virementList: any[] = [];
  successMessage!: string
  modalRef!: NgbModalRef;
  errorMessage: string = '';
  @ViewChild('successModal') successModal!: TemplateRef<any>;
  selectedPayement: MethodePayement | undefined;
  modeList: MethodePayement[] = [];
  entrepriseList: any[] = [];
  userInfo: any;
  boutonActifIndex: number = 1;
  entrepriseNom: string = ''
  entrepriseInfo: any;


  constructor(
    private _parametresService: CrmService,
    private _modalService: NgbModal,
  ) {

  }

  ngOnInit(): void {
    this.getUser();
  }

  ngAfterViewInit() {

  }

  activerBouton(index: number): void {
    this.boutonActifIndex = index;
  }

  estActif(index: number): boolean {
    return this.boutonActifIndex === index;
  }


  getUser() {
    this._parametresService.getUserInfo().subscribe(
      (userData: any) => {
        this.userInfo = userData;

        this._parametresService.partenaireList().subscribe((partners: any[]) => {
          const matchingPartner = partners.find(partner => partner.personne_ptr === userData.user_id);

          if (matchingPartner) {
            const idPartenaire = matchingPartner.id_partenaire;
            this.rechercheBanqueAssociée(idPartenaire);
            this.recherchePayPalAssociée(idPartenaire);
            this.rechercheStripeAssociée(idPartenaire);

            this._parametresService.getEntreprisesPartenaire().subscribe((entrepriseData: any) => {
              this.entrepriseInfo = entrepriseData.find((entreprise: { partenaire: any; }) => entreprise.partenaire === idPartenaire);
              this.getAttribut();
              this.getTypeVehicule();

              console.log(this.entrepriseInfo); // Affichez les informations sur l'entreprise si nécessaire
            });
          }


        });
      },
      (error) => {
        console.error('Erreur', error);
      }
    );
  }

  private rechercheBanqueAssociée(idPartenaire: number): void {
    this._parametresService.getAllVirement().subscribe((dataVirement: any) => {
      // Utilisez filter au lieu de find pour obtenir tous les virements correspondants au partenaire
      this.virementList = dataVirement.filter((virement: { partenaire: any; }) => virement.partenaire === idPartenaire);
    });
  }

  private recherchePayPalAssociée(idPartenaire: number): void {
    this._parametresService.getAllPaypal().subscribe((dataPaypal: any) => {
      // Utilisez filter au lieu de find pour obtenir tous les comptes PayPal correspondants au partenaire
      this.paypalList = dataPaypal.filter((paypal: { partenaire: any; }) => paypal.partenaire === idPartenaire);
    });
  }

  private rechercheStripeAssociée(idPartenaire: number): void {
    this._parametresService.getAllStripe().subscribe((dataStripe: any) => {
      // Utilisez filter au lieu de find pour obtenir tous les comptes Stripe correspondants au partenaire
      this.stripeList = dataStripe.filter((stripe: { partenaire: any; }) => stripe.partenaire === idPartenaire);
    });
  }

  getAttribut(): void {
    this._parametresService.getAllAttribut().subscribe((data: Attribut[]) => {
      this.attributList = data;

      // Vérifiez si les informations sur l'entreprise existent
      if (this.entrepriseInfo) {
        // Filtrer les attributs par entreprise
        this.attributList = this.attributList.filter(
          (attribut) => attribut.entreprise === this.entrepriseInfo.id // Assurez-vous d'utiliser le bon attribut pour l'id de l'entreprise
        );
      }
    });
  }

  getTypeVehicule(): void {
    this._parametresService.getAllTypeVehicule().subscribe((data: TypeVehicule[]) => {
      this.typeVehiculeList = data;
       // Vérifiez si les informations sur l'entreprise existent
       if (this.entrepriseInfo) {
        // Filtrer les attributs par entreprise
        this.typeVehiculeList = this.typeVehiculeList.filter(
          (type) => type.entreprise === this.entrepriseInfo.id // Assurez-vous d'utiliser le bon attribut pour l'id de l'entreprise
        );
      }
    });
  }

  getLogoUrl(logoFileName: string): string {
    if (logoFileName) {
      // Utilisez le chemin vers le dossier des logos sur votre serveur Django.
      return logoFileName;
    } else {
      // Utilisez un chemin local vers une image par défaut.
      return '/assets/img/logo.jpg';
    }
  }

  openModal(content: any): void {
    this._modalService.open(content, { centered: true });
  }

  closePage() {
    this._modalService.dismissAll();
  }

  // getVirement(): void {
  //   this._parametresService.getAllVirement().subscribe((data) => {
  //     this.virementList = data;

  //   });
  // }

  // getPaypal(): void {
  //   this._parametresService.getAllPaypal().subscribe((data) => {
  //     this.paypalList = data;
  //   });
  // }

  // getStripe(): void {
  //   this._parametresService.getAllStripe().subscribe((data) => {
  //     this.stripeList = data;
  //   });
  // }

  // getAttribut(): void {
  //   this._parametresService.getAllAttribut().subscribe((data: Attribut[]) => {
  //     this.attributList = data;

  //     // Filtrer les attributs par entreprise
  //     this.attributList.forEach((attribut) => {
  //       attribut.entreprise = this.entrepriseList.find(
  //         (entreprise) => entreprise.id === attribut.entreprise
  //       );

  //       // Vous pouvez également définir une propriété spécifique pour stocker le nom de l'entreprise
  //       attribut.entreprise = attribut.entreprise ? attribut.entreprise.nom : '';
  //     });
  //   });
  // }


  openConfirmationModal(content: any, id: any) {
    this._modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      if (result === 'confirm') {
        this.delete(id);
      }
    }, (reason) => {
      // Modal closed without confirming (cancel or backdrop click)
    });
  }

  openConfirmationModal2(content: any, id: any) {
    this._modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      if (result === 'confirm') {
        this.delete2(id);
      }
    }, (reason) => {
      // Modal closed without confirming (cancel or backdrop click)
    });
  }

  delete(id: any): void {
    if (this.attributList) {
      this._parametresService.deleteAttribut(id).subscribe({
        next: (res) => {
          console.log(res, 'la donnée a été supprimée avec succès');
          window.location.reload()
        },
        error: (e) => console.error(e)
      });
    } else {
      console.error('Impossible de supprimer la donnee : ID non valide');
    }
  }

  delete2(id: any): void {
    if (this.attributList) {
      this._parametresService.deleteTypeVehicule(id).subscribe({
        next: (res) => {
          console.log(res, 'la donnée a été supprimée avec succès');
          window.location.reload()
        },
        error: (e) => console.error(e)
      });
    } else {
      console.error('Impossible de supprimer la donnee  : ID non valide');
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

}
