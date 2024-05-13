import { Component, OnInit, ViewChild } from '@angular/core';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-view-entreprise',
  templateUrl: './view-entreprise.component.html',
  styleUrls: ['./view-entreprise.component.css']
})
export class ViewEntrepriseComponent implements OnInit {
  entreprises: any[] = [];
  vehicules: any[] = [];
  chauffeurs: any[] = [];
  vehiculesCount: number = 0;
  chauffeursCount: number = 0;
  userInfo: any;
  @ViewChild('entrepriseButton') entrepriseButton: any;


  constructor(private _gveService: CrmService,) { }

  ngOnInit(): void {
    this.getUser()
  }

  getUser() {
    this._gveService.getUserInfo().subscribe(
      (userData: any) => {
        this.userInfo = userData;
        console.log(userData);

        this._gveService.partenaireList().subscribe((partners: any[]) => {
          // Recherche du partenaire correspondant à user_id
          const matchingPartner = partners.find(partner => partner.personne_ptr === userData.user_id);

          if (matchingPartner) {
            const idPartenaire = matchingPartner.id_partenaire;

            this._gveService.getEntreprisesPartenaire().subscribe((entrepriseData: any) => {
              // Filtrer les entreprises par id_partenaire
              this.entreprises = entrepriseData.filter((entreprise: { partenaire: any; }) => entreprise.partenaire === idPartenaire);
              console.log(this.entreprises);
            });
          }
        });
      },
      (error) => {
        console.error('Erreur', error);
      }
    );
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

  areInfosIncomplete(): boolean {
    // Ajoutez ici la logique pour vérifier si au moins 5 attributs sont null
    const nullAttributesCount = Object.values(this.entreprises[0]).filter(value => value === null).length;
    return nullAttributesCount >= 6;
  }
}
