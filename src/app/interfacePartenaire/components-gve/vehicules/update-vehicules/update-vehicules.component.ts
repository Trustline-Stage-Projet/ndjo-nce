import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TypeVehicule } from 'src/app/utilitaire/models/parametres';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

declare const google: any;


@Component({
  selector: 'app-update-vehicules',
  templateUrl: './update-vehicules.component.html',
  styleUrls: ['./update-vehicules.component.css']
})
export class UpdateVehiculesComponent implements OnInit {
  
  ancienCheminImage: any;
  vehiculeId!: number;
  vehicule: any; // Assurez-vous d'avoir une classe ou une interface pour représenter un véhicule
  successMessage!: string;
  modalRef!: NgbModalRef;
  @ViewChild('successModal') successModal!: TemplateRef<any>; // Référence à l'élément ng-template
  vehiculeForm: FormGroup;
  selectedFile: File | null = null;
  Preview: string | null = null;
  typesVehicules: TypeVehicule[] = [];
  tempsDisponibiliteToggle: boolean = false;
  entrepriseId!: number;
  entreprises!: any[];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _gveService: CrmService,
    private _parametresService: CrmService,
    private _modalService: NgbModal
  ) {
    this.vehiculeForm = this.formBuilder.group({
      typeVehicule: ['', Validators.required],
      marque: ['', Validators.required],
      modele: ['', Validators.required],
      annee_fabrication: ['', Validators.required],
      immatriculation: ['', Validators.required],
      capacite_passagers: ['', Validators.required],
      capacite_chargement: ['', Validators.required],
      tempsDisponibilite: [''],
      lieu_de_base: ['', Validators.required],
      moteur: [''],
      couleur_interieur: [''],
      couleur_exterieur: [''],
      puissance: [''],
      type_carburant: [''],
      longueur: [''],
      transmission: [''],
      supplement: ['']
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.entrepriseId = +params['entrepriseId'];
      console.log(this.entrepriseId)
      this.route.params.subscribe((params) => {
        this.vehiculeId = +params['id'];
        this.initAutocomplete();
        // Utilisez le service pour récupérer les données du véhicule par ID
        this._gveService.getVehiculeDetail(this.vehiculeId).subscribe(
          (vehicule) => {
            this.vehicule = vehicule;
            this.ancienCheminImage = vehicule.galerie;
            // Remplissez le formulaire avec les données du véhicule récupéré
            this.vehiculeForm.patchValue(vehicule);
          },
          (error) => {
            console.error('Erreur lors de la récupération des données du véhicule:', error);
          }
        );
      });
    })
    this.getTypeVehicule();
  }

  generateOptions(nombre_maximum: number): number[] {
    return Array.from({ length: nombre_maximum }, (_, i) => i + 1);
  }


  getTypeVehicule(): void {
    // Étape 1 : Récupérer la liste totale des entreprises
    this._gveService.getEntreprises().subscribe((entrepriseData: any) => {
      this.entreprises = entrepriseData;

      // Étape 2 : Filtrer les entreprises par type
      const entrepriseType1 = this.entreprises.find(entreprise => entreprise.type_entreprise === 'mon_entreprise');
      const entrepriseType2 = this.entreprises.find(entreprise => entreprise.id === this.entrepriseId); // Remplacez entrepriseId par la valeur appropriée

      // Vérifier que les deux types d'entreprises ont été trouvés
      if (entrepriseType1 && entrepriseType2) {
        // Étape 3 : Récupérer tous les types de véhicules
        this._parametresService.getAllTypeVehicule().subscribe((data: TypeVehicule[]) => {
          // Étape 4 : Filtrer les types de véhicules en fonction des IDs d'entreprises
          this.typesVehicules = data.filter(typeVehicule =>
            typeVehicule.entreprise === entrepriseType1.id || typeVehicule.entreprise === entrepriseType2.id
          );
        });
      }
    });
  }
  
  private getLogoPreview(galerie: File | null): void {
    if (galerie instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        this.ancienCheminImage = '';
        this.Preview = reader.result as string;
      };
      reader.readAsDataURL(galerie);
    } else {
      this.Preview = null; // Définissez logoPreview sur null si le logo est null
    }
  }

  switchToggle() {
    this.tempsDisponibiliteToggle = !this.tempsDisponibiliteToggle;

    // Réinitialiser tempsDisponibilite à vide
    if (this.vehiculeForm) {
      const tempsDisponibiliteControl = this.vehiculeForm.get('tempsDisponibilite');
      if (tempsDisponibiliteControl) {
        tempsDisponibiliteControl.reset('');
      }
    }
  }

  // Méthode pour gérer la sélection d'un fichier
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
    this.getLogoPreview(event.target.files[0]); // Mettez à jour l'aperçu du logo lorsque le fichier change
  }

  // Méthode pour soumettre le formulaire de mise à jour
  onUpdate() {

    if (this.vehiculeForm.valid) {
      // Vérification et assignation des valeurs par défaut
      const tempsDisponibiliteValue = this.vehiculeForm.value.tempsDisponibilite;
      if (!this.tempsDisponibiliteToggle) {
        // Si tempsDisponibiliteToggle est false et tempsDisponibilite est vide ou null, mettre 3h par défaut
        if (!tempsDisponibiliteValue) {
          this.vehiculeForm.patchValue({ tempsDisponibilite: '3h' });
        }
      } else {
        // Si tempsDisponibiliteToggle est true et tempsDisponibilite est vide ou null, mettre 1j par défaut
        if (!tempsDisponibiliteValue) {
          this.vehiculeForm.patchValue({ tempsDisponibilite: '1j' });
        } else if (tempsDisponibiliteValue === '3h') {
          // Si tempsDisponibiliteToggle est true et tempsDisponibilite est égal à 3h, mettre 3h par défaut
          this.vehiculeForm.patchValue({ tempsDisponibilite: '1j' });
        }
      }

      // Le reste de votre code pour la soumission du formulaire
      const formData = new FormData();

      for (const key in this.vehiculeForm.value) {
        if (this.vehiculeForm.value.hasOwnProperty(key)) {
          formData.append(key, this.vehiculeForm.value[key]);
        }
      }

      if (this.selectedFile) {
        formData.append('galerie', this.selectedFile);
      }

      // Envoyez les données au service pour mettre à jour le véhicule
      this._gveService.updateVehicule(this.vehiculeId, formData).subscribe(
        (response) => {
          console.log('Véhicule mis à jour avec succès', response);
          this.successMessage = 'Données mises à jour avec succès';
          this.openSuccessModal();
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du véhicule:', error);
          // Affichez un message d'erreur à l'utilisateur ou effectuez d'autres actions en cas d'erreur
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

  initAutocomplete() {
    // lieu_de_base de départ
    const lieu_de_baseInput = document.getElementById('lieu_de_base') as HTMLInputElement;
    const lieu_de_baseAutocomplete = new google.maps.places.Autocomplete(lieu_de_baseInput, {
      types: ['geocode', 'establishment']
    });
    lieu_de_baseAutocomplete.addListener('place_changed', () => {
      const place = lieu_de_baseAutocomplete.getPlace();
      if (place && place.formatted_address) {
        this.vehiculeForm.patchValue({ lieu_de_base: place.formatted_address });
      }
    });
  }

  // supprimer une reservation
  delete(): void {
    if (this.vehicule && this.vehiculeId) {
      this._gveService.deleteVehicule(this.vehiculeId).subscribe({
        next: (res) => {
          console.log(res, 'vehicule supprimer avec succes');

          this.router.navigate(['/listVehicules']);
        },
        error: (e) => console.error(e)
      });
    } else {
      console.error('Impossible de supprimer le vehicule : ID non valide');
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
        this.onUpdate();
      }
    }, (reason) => {
      // Modal closed without confirming (cancel or backdrop click)
    });
  }
}
