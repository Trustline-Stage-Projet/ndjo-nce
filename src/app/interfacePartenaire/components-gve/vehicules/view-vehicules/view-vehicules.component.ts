import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-view-vehicules',
  templateUrl: './view-vehicules.component.html',
  styleUrls: ['./view-vehicules.component.css']
})
export class ViewVehiculesComponent implements OnInit {
  vehicules: any[] = [];
  vehiculesCount!: number;
  entrepriseId!: number;
  prixList: any;

  constructor(private _gveService: CrmService,
    private route: ActivatedRoute,
  ) { }


  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.entrepriseId = +params['id'];
      this._gveService.getVehiculesForEntreprise(this.entrepriseId).subscribe((data) => {
        this.vehicules = data;
        console.log(data)

        this.vehiculesCount = this.vehicules.length;
      });
    });

    this._gveService.getPrix().subscribe((data) => {
      this.prixList = data;
    });
  }
  getPrixId(vehiculeId: number): number | null {
    const prix = this.prixList.find((prix: { vehicule: number; }) => prix.vehicule === vehiculeId);
    return prix ? prix.id : null;
}

  hasPrix(vehiculeId: number): boolean {
    return this.prixList && this.prixList.some((prix: { vehicule: number; }) => prix.vehicule === vehiculeId);
  }

  getLogoUrl(galerieFileName: string): string {
    if (galerieFileName) {
      // Utilisez le chemin vers le dossier des logos sur votre serveur Django.
      return galerieFileName;
    } else {
      // Utilisez un chemin local vers une image par défaut.
      return '/assets/img/logo.jpg';
    }
  }
}
