import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

declare const google: any;

@Component({
  selector: 'app-update-profil',
  templateUrl: './update-profil.component.html',
  styleUrls: ['./update-profil.component.css'],
})
export class UpdateProfilComponent implements OnInit {
  userInfo: any;
  id: any;

  langues: any[] = [
    { id: 1, nom: 'Anglais' },
    { id: 2, nom: 'Chinois Mandarin' },
    { id: 3, nom: 'Hindi' },
    { id: 4, nom: 'Espagnol' },
    { id: 5, nom: 'Français' },
    { id: 6, nom: 'Arabe' },
    { id: 7, nom: 'Bengali' },
    { id: 8, nom: 'Russe' },
    { id: 9, nom: 'Portugais' },
    { id: 10, nom: 'Indonésien' },
  ];
  successMessage!: string;
  loading: boolean = false;
  selectedFile: File | null = null;
  errorMessage!: string;
  photoUrl: string | null = null;

  chauffeurForm: FormGroup;

  constructor(
    private _dataService: CrmService,
    private formBuilder: FormBuilder,
    private _modalService: NgbModal,
    private route: ActivatedRoute

  ) {
    this.chauffeurForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''],
      annee_experience: ['', Validators.required],
      langues_parlees: new FormArray([]),
      photo: null,
      entreprise_affiliee: null,
    });
    this.addCheckboxes();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.id = id;
    this.getUser();
  }

  getUser() {
    this._dataService.getUserInfo().subscribe(
      (donnee: any) => {
        this._dataService.getChauffeurDetails(donnee.user_id).subscribe(
          (data) => {
            this.chauffeurForm.patchValue({
              first_name: data.first_name,
              last_name: data.last_name,
              telephone: data.telephone,
              adresse: data.adresse,
              email: data.email,
              annee_experience: data.annee_experience,
            });

            this.updateLanguageCheckboxes(data.langues_parlees);
            this.photoUrl = data.photo; // Assurez-vous que cela correspond à la structure de vos données
          },
          (error) => {
            console.log(
              'Erreur lors de la récupération des détails du chauffeur:',
              error
            );
          }
        );
      },
      (error) => {
        console.error('erreur', error);
      }
    );
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
    }
  }
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  private updateLanguageCheckboxes(languesParlees: any) {
    let languesBooleans: boolean[] = [];

    if (typeof languesParlees === 'string') {
      // Cas où languesParlees est une chaîne de caractères représentant un tableau de booléens ou de nombres
      try {
        // Tente d'analyser comme JSON
        const parsed = JSON.parse(languesParlees);
        if (Array.isArray(parsed)) {
          languesBooleans = parsed.map((value) => !!value);
        } else {
          // Si la chaîne est séparée par des virgules sans être un JSON valide
          languesBooleans = languesParlees
            .split(',')
            .map((str) => str.trim().toLowerCase() === 'true');
        }
      } catch (error) {
        // Fallback si la chaîne n'est ni un JSON valide ni séparée correctement par des virgules
        languesBooleans = languesParlees
          .split(',')
          .map((str) => str.trim().toLowerCase() === 'true');
      }
    } else if (Array.isArray(languesParlees)) {
      // Cas d'un tableau directement
      languesBooleans = languesParlees.map((value) => !!value);
    } else if (typeof languesParlees === 'object' && languesParlees !== null) {
      // Cas d'un objet avec des valeurs booléennes
      languesBooleans = Object.values(languesParlees).map((value) => !!value);
    }

    // Mettre à jour les cases à cocher des langues
    this.languesFormArray.controls.forEach((control, index) => {
      const langueEstParlee = languesBooleans[index] || false; // S'assure que la valeur par défaut est false si undefined
      control.setValue(langueEstParlee);
    });
  }

  private addCheckboxes() {
    this.langues.forEach(() =>
      this.languesFormArray.push(new FormControl(false))
    );
  }

  get languesFormArray() {
    return this.chauffeurForm.controls['langues_parlees'] as FormArray;
  }

  initAutocomplete() {
    // Adresse de départ
    const adresseInput = document.getElementById('adresse') as HTMLInputElement;
    const adresseAutocomplete = new google.maps.places.Autocomplete(
      adresseInput,
      {
        types: ['geocode', 'establishment'],
      }
    );
    adresseAutocomplete.addListener('place_changed', () => {
      const place = adresseAutocomplete.getPlace();
      if (place && place.formatted_address) {
        this.chauffeurForm.patchValue({ adresse: place.formatted_address });
      }
    });
  }

  // // Méthode pour soumettre le formulaire
  // onSubmit(content: any) {
  //   console.log(this.chauffeurForm.value);
  //   // Envoyez les données au service
  //   this.loading = true;
  //   const updateData = this.chauffeurForm.value;
  //   setTimeout(() => {
  //     this._dataService.PersonnalUpdateChauffeur(this.id, updateData).subscribe(
  //       (response) => {
  //         this.loading = false;
  //         // E-mail envoyé avec succès, affichez un message de succès dans le modal
  //         this._modalService.open(content, { centered: true });
  //         this.successMessage = 'Données on ete Enregistrer avec succès';
  //       },
  //       (error) => {
  //         this.loading = false;
  //         // Échec : Affichez l'erreur à l'utilisateur dans le modal
  //         if (error.status === 400) {
  //           this.errorMessage = "Le nom ou l'adresse e-mail existe déjà.";
  //         } else {
  //           this.errorMessage =
  //             "Une erreur s'est produite lors de l'enregistrement du chauffeur.";
  //         }

  //         this._modalService.open(content, { centered: true });
  //       }
  //     );
  //   }, 1000);
  // }

  onSubmit(content: any) {
    const formData = new FormData();
    // Ajoutez chaque champ du formulaire dans l'objet FormData
    Object.keys(this.chauffeurForm.value).forEach((key) => {
      if (key !== 'photo') {
        // Pour tous les champs sauf 'photo'
        formData.append(key, this.chauffeurForm.value[key]);
      }
    });

    // Ajouter la photo si elle a été sélectionnée
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile, this.selectedFile.name);
    }

    console.log('Envoi des données du formulaire avec la photo');
    this.loading = true;

    // Remplacer cette partie par l'appel à votre service, utilisant formData
    setTimeout(() => {
      this._dataService.PersonnalUpdateChauffeur(this.id, formData).subscribe(
        (response) => {
          // Le reste de votre code de gestion de la réponse...
          this.loading = false;
          this._modalService.open(content, { centered: true });
          this.successMessage = 'Données on ete Enregistrer avec succès';
        },
        (error) => {
          // Gestion de l'erreur...
          this.loading = false;
          this.errorMessage = 'Erreur survenue lors de l\'enregistrement des Données';

          this._modalService.open(content, { centered: true });
        }
      );
    }, 1000);
  }


}
