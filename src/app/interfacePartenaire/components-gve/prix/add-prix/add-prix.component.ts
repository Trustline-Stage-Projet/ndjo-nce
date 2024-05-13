import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-add-prix',
  templateUrl: './add-prix.component.html',
  styleUrls: ['./add-prix.component.css']
})
export class AddPrixComponent {
  prixForm!: FormGroup;
  vehiculeId!: number;
  entrepriseId!: number;
  successMessage!: string
  modalRef!: NgbModalRef;
  @ViewChild('successModal') successModal!: TemplateRef<any>; // Référence à l'élément ng-template

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _gveService: CrmService,
    private _modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.vehiculeId = +params['vehiculeId'];
      this.entrepriseId = +params['entrepriseId'];

      this.initForm();
    });
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

  addPrix(): void {
    if (this.prixForm.valid) {
      const prixData = {
        vehicule: this.vehiculeId, // Utilisez l'ID du véhicule directement.
        ...this.prixForm.value
      };

      this._gveService.createPrix(prixData).subscribe(() => {
        this.successMessage = 'Données ajouter avec succès';
          this.openSuccessModal();
      });
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
