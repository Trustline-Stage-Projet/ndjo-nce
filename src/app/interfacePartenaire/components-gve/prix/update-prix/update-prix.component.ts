import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Prix } from 'src/app/utilitaire/models/gve';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-update-prix',
  templateUrl: './update-prix.component.html',
  styleUrls: ['./update-prix.component.css']
})
export class UpdatePrixComponent {
  successMessage!: string;
  modalRef!: NgbModalRef;
  @ViewChild('successModal') successModal!: TemplateRef<any>;
  prixId!: number;
  prix: Prix | undefined; // Utilisez le type Prix avec une valeur potentielle undefined
  prixForm!: FormGroup;
  etat: 'affichage' | 'modification' = 'affichage'; // État initial : affichage
  entrepriseId!:number;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _gveService: CrmService,
    private formBuilder: FormBuilder,
    private _modalService: NgbModal

  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.entrepriseId = +params['entrepriseId'];
    });
    this.route.params.subscribe(params => {
      this.prixId = +params['id'];
      this.getPrixDetails();
    });

    this.initForm();
  }

  initForm(): void {
    this.prixForm = this.formBuilder.group({
      prixParKm: [0, Validators.required],
      prixParDuree: [0, Validators.required],
      fraisReservation: [0, Validators.required],
      fraisLivraison: [0, Validators.required],
      fraisParDefaut: [0, Validators.required]
    });
  }

  getPrixDetails(): void {
    this._gveService.getPrixDetail(this.prixId).subscribe(
      (prix) => {
        if (prix) {
          this.prix = prix;
          this.prixForm.patchValue(prix);
        } else {
          console.log("Les données du prix ne sont pas disponibles.");
        }
      },
      (error) => {
        console.error("Erreur lors de la récupération des données du prix :", error);
      }
    );
  }

  toggleEtat(): void {
    this.etat = this.etat === 'affichage' ? 'modification' : 'affichage';
  }

  updatePrix(): void {
    if (this.prixForm.valid && this.prix) {
      const prixData = {
        ...this.prixForm.value
      };

      this._gveService.updatePrix(this.prixId, prixData).subscribe(
        (data) => {
          console.log(data);
          this.successMessage = 'Données mises à jour avec succès';
          this.openSuccessModal();
          this.etat = 'affichage';
        },
        (error) => {
          console.error("Erreur lors de la mise à jour du prix :", error);
        }
      );
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
    if (this.prix && this.prixId) {
      this._gveService.deletePrix(this.prixId).subscribe({
        next: (res) => {
          this.router.navigate(['/listVehicules/{{entrepriseId}}']);
        },
        error: (e) => console.error(e)
      });
    } else {
      console.error('Impossible de supprimer : ID non valide');
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
        this.updatePrix();
      }
    }, (reason) => {
      // Modal closed without confirming (cancel or backdrop click)
    });
  }
}
