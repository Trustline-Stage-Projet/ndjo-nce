import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

declare const google: any;


@Component({
  selector: 'app-add-chauffeur',
  templateUrl: './add-chauffeur.component.html',
  styleUrls: ['./add-chauffeur.component.css']
})

export class AddChauffeurComponent implements OnInit {

  chauffeurForm: FormGroup;
  entrepriseId!: number;
  entreprise: any; // Assurez-vous d'avoir une classe ou une interface pour représenter une entreprise
  successMessage!: string
  loading: boolean = false;
  selectedFile: File | null = null;
  errorMessage!: string;
  modalRef!: NgbModalRef;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private _gveService: CrmService,
    private _modalService: NgbModal,
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
      password: ['', [Validators.required]],
      repassword: ['', [Validators.required]],
      type_utilisateur: ['chauffeur'],
    });
    this.addCheckboxes();

  }
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
    { id: 10, nom: 'Indonésien' }
  ];
  
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.entrepriseId = +params['entrepriseId'];
      // Utilisez le service pour récupérer les données de l'entreprise par ID
      // this._gveService.getEntrepriseDetail(this.entrepriseId).subscribe(
      //   (entreprise) => {
      //     this.entreprise = entreprise;
      //   },
      //   (error) => {
      //     console.error('Erreur lors de la récupération des données de l\'entreprise:', error);
      //   }
      // );
    });
  }

  
  private addCheckboxes() {
    this.langues.forEach(() => this.languesFormArray.push(new FormControl(false)));
  }

  get languesFormArray() {
    return this.chauffeurForm.controls['langues_parlees'] as FormArray;
  }


  // Méthode pour gérer la sélection d'un fichier
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  generateRandomPassword(length: number): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }

    return password;
  }

  // Méthode pour générer le mot de passe en fonction du type de client
  generatePassword(): string {
    return this.generateRandomPassword(10);
  }



  // Méthode pour soumettre le formulaire
  onSubmit(content: any) {


    // Générez le mot de passe avant de soumettre le formulaire
    const password = this.generatePassword();
    // Assurez-vous d'attribuer la valeur générée aux champs du formulaire
    this.chauffeurForm.get('password')?.setValue(password);
    this.chauffeurForm.get('repassword')?.setValue(password);
    this.chauffeurForm.get('entreprise_affiliee')?.setValue(this.entrepriseId);
    const emailData = {
      first_name: this.chauffeurForm.get('first_name')?.value,
      last_name: this.chauffeurForm.get('last_name')?.value,
      telephone: this.chauffeurForm.get('telephone')?.value,
      adresse: this.chauffeurForm.get('adresse')?.value,
      email: this.chauffeurForm.get('email')?.value,
      password: this.chauffeurForm.get('password')?.value,
      type_utilisateur: this.chauffeurForm.get('type_utilisateur')?.value,
    };

    const formData = new FormData();

    for (const key in this.chauffeurForm.value) {
      if (this.chauffeurForm.value.hasOwnProperty(key)) {
        formData.append(key, this.chauffeurForm.value[key]);
      }
    }

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }
    // Envoyez les données au service
    this.loading = true;


    setTimeout(() => {
      this._gveService.registerUser(formData).subscribe(
        (response) => {
          this._gveService.sendRegistrationEmail(emailData).subscribe(
            () => {
              this.loading = false;
              // E-mail envoyé avec succès, affichez un message de succès dans le modal
              this.successMessage = 'chauffeur enregistré avec succès et e-mail envoyé.';
              this._modalService.open(content, { centered: true });
            },
            (emailError) => {
              this.loading = false;
              // Échec de l'envoi de l'e-mail
              this.errorMessage = 'Erreur lors de l\'envoi de l\'e-mail : ' + emailError.message;
              this._modalService.open(content, { centered: true });
            }
          );
          console.log('Chauffeur ajouté avec succès', response);
          this.successMessage = 'Données on ete ajouter avec succès';
        },
        (error) => {
          this.loading = false;
          // Échec : Affichez l'erreur à l'utilisateur dans le modal
          if (error.status === 400) {
            this.errorMessage = 'Le nom ou l\'adresse e-mail existe déjà.';
          } else {
            this.errorMessage = 'Une erreur s\'est produite lors de l\'enregistrement du chauffeur.';
          }

          this._modalService.open(content, { centered: true });
        }
      );
    }, 1000);


  }


  initAutocomplete() {
    // Adresse de départ
    const adresseInput = document.getElementById('adresse') as HTMLInputElement;
    const adresseAutocomplete = new google.maps.places.Autocomplete(adresseInput, {
      types: ['geocode', 'establishment']
    });
    adresseAutocomplete.addListener('place_changed', () => {
      const place = adresseAutocomplete.getPlace();
      if (place && place.formatted_address) {
        this.chauffeurForm.patchValue({ adresse: place.formatted_address });
      }
    });

  }


}
