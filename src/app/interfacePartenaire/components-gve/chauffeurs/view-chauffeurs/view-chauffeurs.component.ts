import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-view-chauffeurs',
  templateUrl: './view-chauffeurs.component.html',
  styleUrls: ['./view-chauffeurs.component.css']
})

export class ViewChauffeursComponent implements OnInit {
  chauffeurs: any[] = [];
  chauffeursCount!: number;
  entrepriseId!: number;

  constructor(private _gveService: CrmService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.entrepriseId = +params['id'];
      this._gveService.getChauffeursForEntreprise(this.entrepriseId).subscribe((data) => {
        console.log(data)
        this.chauffeurs = data;
        this.chauffeursCount = this.chauffeurs.length;
      });
    });
  }



  getLogoUrl(photoFileName: string): string {
    if (photoFileName) {
      // Utilisez le chemin vers le dossier des logos sur votre serveur Django.
      return photoFileName;
    } else {
      // Utilisez un chemin local vers une image par défaut.
      return '/assets/img/logo.jpg';
    }
  }
}
