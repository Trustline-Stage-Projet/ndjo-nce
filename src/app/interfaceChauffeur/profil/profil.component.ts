import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css'],
})
export class ProfilComponent implements OnInit {
  userInfo: any;
  id: any;
  entreprise: any;
  reservations: any;
  nombreReservationsTerminees!: number;
  showForm: boolean = false;
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
  form: FormGroup;

  constructor(
    private _dataService: CrmService,
    private formBuilder: FormBuilder,
    private router: Router,
    private _modalService: NgbModal
  ) {
    this.form = this.formBuilder.group({
      user_id: null,
      entreprise_key: ['', [Validators.required, Validators.minLength(25)]],
    });
  }

  ngOnInit(): void {
    this.getUser();
  }

  isEntrepriseKeyRequiredError(): boolean {
    const control = this.form.get('entreprise_key');
    return !!control && control.touched && control.errors?.['required'];
  }

  onSubmit(content: any) {
    this.form.patchValue({
      user_id: this.id,
    });
    this.loading = true;

    setTimeout(() => {
    this._dataService.associerChauffeurEntreprise(this.form.value).subscribe(
      (data) => {
        this.successMessage = 'votre compte a ete  affilie avec success';
        this.loading = false;
        console.log('donnee affilier',data)
        this._modalService.open(content, { centered: true });
        // error: (error) => console.error(error)
      },
      (error) => {
        console.error('erreur', error);
        this.successMessage = 'Une erreur est survenue lors de l\'affilation';
        this.loading = false;
        this._modalService.open(content, { centered: true });

      }
    );}, 1000);

  }

  Modal(content: any) {
    this._modalService.open(content, { centered: true });
  }

  getUser() {
    this._dataService.getUserInfo().subscribe(
      (donnee: any) => {
        console.log(donnee)
        this.getReservations(donnee.user_id);
        this.id = donnee.user_id;
        this._dataService.getChauffeurDetails(donnee.user_id).subscribe(
          (data) => {
            this.userInfo = data;
            if(data.entreprise_affiliee !== null){
              this.getEntreprise(data.entreprise_affiliee);
            }
            console.log('Détails du chauffeur:', this.userInfo);
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

  toggleForm(): void {
    this.showForm = !this.showForm; // Toggles between true and false
  }

  getReservations(id_user: any): void {
    this._dataService.getReservationsByUserId(id_user).subscribe({
      next: (data) => {
        // Filtrer les réservations pour ne garder que celles avec statutReservation = 'terminer'
        const reservationsTerminees = data.filter(
          (reservation: { statutReservation: string }) =>
            reservation.statutReservation === 'terminer'
        );
        // Compter les réservations terminées
        const nombreReservationsTerminees = reservationsTerminees.length;
        // Mettre à jour l'état/component avec les réservations terminées et leur nombre
        this.nombreReservationsTerminees = nombreReservationsTerminees;
      },
      error: (error) => {
        console.error(
          'Erreur lors de la récupération des réservations:',
          error
        );
      },
    });
  }

  getLanguesParlees(langues_parlees: any): string[] {
    let languesParleesBooleans: boolean[];

    if (typeof langues_parlees === 'string') {
      // Cas d'une chaîne de caractères "true,false,..."
      languesParleesBooleans = langues_parlees
        .split(',')
        .map((str) => str === 'true');
    } else if (Array.isArray(langues_parlees)) {
      // Cas d'un tableau [false, true, ...]
      languesParleesBooleans = langues_parlees;
    } else if (typeof langues_parlees === 'object') {
      // Cas d'un objet {false, true, ...}, ce qui n'est pas valide en JS/TS mais on gère si c'est une typo
      // Convertir l'objet en tableau de valeurs
      languesParleesBooleans = Object.values(langues_parlees).map(
        (val) => val === 'true'
      );
    } else {
      // Si le type n'est pas reconnu, retourner un tableau vide
      return [];
    }

    // Filtrage des langues en fonction du tableau de booléens
    let languesFiltrees = this.langues.filter(
      (_, index) => languesParleesBooleans[index]
    );

    // Extraction des noms des langues
    let nomsDesLangues = languesFiltrees.map((langue) => langue.nom);
    return nomsDesLangues;
  }

  Annuler() {
    this.form.reset();
  }

  getLogoUrl(photoFileName: string): string {
    if (photoFileName) {
      // Assurez-vous que cette URL correspond à l'URL de base de votre serveur Django.
      return `http://localhost:8000${photoFileName}`;
    } else {
      // Chemin local vers une image par défaut.
      return '/assets/img/user.png';
    }
  }

  getEntreprise(entreprise: any) {
    this._dataService.getEntrepriseDetail(entreprise).subscribe(
      (entreprise) => {
        this.entreprise = entreprise;
      },
      (error) => {
        console.error(
          "Erreur lors de la récupération des données de l'entreprise:",
          error
        );
      }
    );
  }

  areInfosIncomplete(userInfo: any): boolean {
    if (!userInfo) {
      return true; // Retourne true si userInfo est null ou undefined
    }

    // Liste des champs à vérifier
    const fieldsToCheck = [
      'entreprise_affiliee',
      'photo',
      'langues_parlees',
      'annee_experience' /* autres champs pertinents */,
    ];

    // Compter le nombre de champs qui sont null ou pour lesquels la condition est vraie (par exemple, langues parlées est une chaîne vide)
    let nullOrEmptyCount = fieldsToCheck.reduce((count, field) => {
      if (
        userInfo[field] === null ||
        userInfo[field] === undefined ||
        (Array.isArray(userInfo[field]) && userInfo[field].length === 0) ||
        (typeof userInfo[field] === 'string' && userInfo[field].trim() === '')
      ) {
        return count + 1;
      }
      return count;
    }, 0);

    // Vérifier si le nombre de champs null ou vides est supérieur ou égal à 9
    return nullOrEmptyCount >= 9;
  }

  openConfirmationModal(content: any, msg :any) {
    this._modalService.open(content, { centered: true, ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      if (result === 'confirm') {
        this.loading = true;
        this.deactivateAccount(msg)
      }
    }, (reason) => {
      // Modal closed without confirming (cancel or backdrop click)
    });
  }


  deactivateAccount(content: any) {
    setTimeout(() => {
      this._dataService.deactivateChauffeurAccount(this.id).subscribe(
        (response) => {
          this.loading = false;
          this.router.navigate(['/log']); // Redirection vers /log
        },
        (error) => {
          this.loading = false;
          this.errorMessage = 'une erreur est survenue lors de la suppression de votre compte'
          this._modalService.open(content, { centered: true });
        }
      );
    }, 1000);
  }

}
