import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthData } from 'src/app/utilitaire/models/user';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

declare const google: any;


@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})
export class ConnexionComponent implements OnInit {
  sessionExpired: boolean = false;
  loginForm!: FormGroup;
  personneForm: FormGroup;
  errorMessage: string | null = null;
  sessionExpiredMessage: string = '';
  passNotMatch: string = '';
  isRegisterFormVisible: boolean = false;
  isResetPasswordVisible: boolean = false;
  isVerificationPasswordVisible: boolean = false;
  isVerifierPasswordVisible: boolean = false;
  emailForm: FormGroup;
  loading: boolean = false;
  passwordResetControlForm: FormGroup;
  enteredDigits: string[] = Array(6).fill('');
  passwordResetForm: FormGroup;
  successMessage!: string
  modalRef!: NgbModalRef;
  @ViewChild('successModal') successModal!: TemplateRef<any>;
  showPassword = false;
  repassword = new FormControl('');

  constructor(private _modalService: NgbModal,
    private fb: FormBuilder,
    private authService: CrmService,
    private router: Router,
    private route: ActivatedRoute) {

    this.emailForm = this.fb.group({
      emailOrPhone: ['', [Validators.required, Validators.email]],
    });

    this.passwordResetControlForm = this.fb.group({
      email: [this.emailForm.value.emailOrPhone, Validators.required], // Pré-remplir avec la valeur de emailForm
      verificationCode: ['', Validators.required],
    });

    this.passwordResetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, this.passwordValidator]],
      confirmNewPassword: ['', [Validators.required, this.passwordValidator, this.matchPasswordValidator('newPassword')]],
    });

    this.loginForm = this.fb.group({
      email_ou_telephone: ['', Validators.required ],
      passCode:  ['', [Validators.required]],
    });

    this.personneForm = this.fb.group({
      first_name: [''],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''],
      password: ['', [Validators.required, this.passwordValidator]],
      repassword: ['', [Validators.required, this.passwordValidator, this.matchPasswordValidator('newPassword')]],
      type_utilisateur: ['']
    }
    );
  }

  ngOnInit() {
    this.session()
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


  passwordValidator(control: { value: any; }) {
    const value = control.value;

    if (!value) {
      return null; // Valeur facultative, la validation ne s'applique pas
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(value);
    const isLengthValid = value.length >= 8;

    const isValid =
      hasUpperCase && hasLowerCase && hasDigit && hasSpecialCharacter && isLengthValid;

    return isValid ? null : { invalidPassword: true };
  }

  matchPasswordValidator(matchTo: string) {
    return (control: AbstractControl) => {
      const matchToControl = control.root.get(matchTo);
      if (matchToControl && control.value !== matchToControl.value) {
        return { passwordsNotMatch: true };
      }
      return null;
    };
  }

  // Méthode pour basculer entre le formulaire de connexion et d'inscription
  toggleRegisterForm() {
    this.isRegisterFormVisible = !this.isRegisterFormVisible;
    // Réinitialisez le message d'erreur lorsque vous basculez entre les formulaires
    this.passNotMatch = '';
  }

  toggleResetForm() {
    this.isResetPasswordVisible = !this.isResetPasswordVisible;
  }


  onDigitInput(event: Event, index: number) {
    const inputElement = event.target as HTMLInputElement;
    this.enteredDigits[index] = inputElement.value;
  }

  toggleVerificationForm() {

    if (this.emailForm.valid) {
      const emailOrPhone = this.emailForm.value.emailOrPhone;
      // Utilise setTimeout pour simuler une attente d'une seconde
      this.loading = true;
      setTimeout(() => {
        this.authService.sendPasswordResetRequest(emailOrPhone).subscribe(
          (response) => {
            // Pré-remplir le champ 'email' dans passwordResetControlForm
            this.passwordResetControlForm.patchValue({
              email: emailOrPhone,
              // Vous pouvez également pré-remplir d'autres champs si nécessaire
            });
            this.loading = false;// Gérer la réponse du serveur
            this.isVerificationPasswordVisible = true
          },
          (error) => {
            console.error(error); // Gérer les erreurs
            this.errorMessage = error.error.error;
            this.loading = false;
            this.isVerificationPasswordVisible = false

          }
        );
      }, 1000); // 1000 millisecondes (1 seconde)
    }
  }

  toggleVerifiernForm() {
    const enteredOTP = this.enteredDigits.join('');
    this.passwordResetControlForm.patchValue({
      verificationCode: enteredOTP,
    });
    if (this.passwordResetControlForm.valid) {

      this.loading = true;

      setTimeout(() => {
        const { email, verificationCode } = this.passwordResetControlForm.value;
        this.authService.verifyPasswordReset(email, verificationCode).subscribe(
          (response) => {
            this.loading = false;// Gérer la réponse du serveur
            // Récupérer l'e-mail de la réponse et le pré-remplir dans le formulaire
            const verifiedEmail = response.email;
            this.passwordResetForm.patchValue({
              email: verifiedEmail,
            });
            this.isVerifierPasswordVisible = true
            this.errorMessage = ''
          },
          (error) => {
            console.error(error); // Gérer les erreurs
            this.loading = false;// Gérer la réponse du serveur
            this.isVerifierPasswordVisible = false
            this.errorMessage = error.error.error; // Utilisez la propriété 'error' pour obtenir le message d'erreur
          }
        );
      }, 1000); // 1000 millisecondes (1 seconde)
    }
  }

  renvoyerCode() {
    if (this.emailForm.valid) {
      const emailOrPhone = this.emailForm.value.emailOrPhone;
      // Utilise setTimeout pour simuler une attente d'une seconde
      this.loading = true;
      setTimeout(() => {
        this.authService.sendPasswordResetRequest(emailOrPhone).subscribe(
          (response) => {
            // Pré-remplir le champ 'email' dans passwordResetControlForm
            this.passwordResetControlForm.patchValue({
              email: emailOrPhone,
              // Vous pouvez également pré-remplir d'autres champs si nécessaire
            });
            this.loading = false;// Gérer la réponse du serveur
          },
          (error) => {
            console.error(error); // Gérer les erreurs
            this.errorMessage = error.error.error;
            this.loading = false;
          }
        );
      }, 1000); // 1000 millisecondes (1 seconde)
    }
  }

  resetPassword() {

    if (this.passwordResetForm.valid) {
      this.loading = true;

      setTimeout(() => {
        const { email, newPassword, confirmNewPassword } = this.passwordResetForm.value;
        this.authService.resetPassword(email, newPassword, confirmNewPassword).subscribe(
          (response) => {
            this.loading = false;
            this.successMessage = 'Le Mot De Passe a ete modifier avec succès';
            this.openSuccessModal();
          },
          (error) => {
            console.error(error); // Gérer les erreurs
            this.errorMessage = error.error.error; // Utilisez la propriété 'error' pour obtenir le message d'erreur
            this.loading = false;
          }
        );
      }, 1000);
    }
  }


  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const repassword = form.get('repassword')?.value;

    return password === repassword ? null : { mismatch: true };
  }

  session() {
    this.route.queryParams.subscribe((params) => {
      if (params['message'] === "Votre session a expiré. Veuillez vous reconnecter.") {
        this.sessionExpired = true;
        this.sessionExpiredMessage = params['message'];
        setTimeout(() => {
          this.sessionExpired = false;
        }, 1000); // Cela effacera le message après 10 secondes
      }
    });
  }

  onConnexionClick(): void {
    this.modalRef.dismiss('Close click');
    location.reload()
  }


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  // onSubmit() {
  //   if (this.loginForm.valid) {
  //     const authData: AuthData = this.loginForm.value;
  //     this.authService.login(authData).subscribe(
  //       (response) => {
  //         // Gérer la réponse de l'API, par exemple, stocker le jeton dans le local storage.
  //         this.router.navigate(['/listEntreprise']);
  //       },
  //       (error) => {
  //         // Gérer les erreurs d'authentification et définir le message d'erreur
  //         this.errorMessage = 'Erreur d\'authentification : ' + error.error.detail;
  //         console.error('Erreur d\'authentification', error);

  //       }
  //     );
  //   }
  // }

  onSubmit() {
    if (this.loginForm.valid) {
      const authData: AuthData = this.loginForm.value;
      this.loading = true;
        setTimeout(() => {
      this.authService.login(authData).subscribe(
        (response) => {
          localStorage.setItem('jwt', response.jwt);
          localStorage.setItem('userType', response.user_type); // Corrigez ici pour correspondre à la clé correcte
          // Redirection basée sur le type d'utilisateur
          const userType = localStorage.getItem('userType'); // Assurez-vous que cela correspond à la clé stockée
          this.loading = false;

          switch (userType) {
            case 'partenaire':
              this.router.navigate(['/course']);
              break;
            case 'chauffeur':
              this.router.navigate(['/mesCourses']);
              break;
            default:
              this.router.navigate(['/']); // Redirection par défaut
          }
        },
        (error) => {
          this.errorMessage = 'Erreur d\'authentification'
          this.loading = false;
          console.error('Erreur d\'authentification', error);
        }
      );}, 1000);
    }
  }


  registerPersonne() {
    if (this.personneForm.valid) {
      const password = this.personneForm.get('password')?.value;
      const repassword = this.personneForm.get('repassword')?.value;

      if (password === repassword) {
        // Les mots de passe correspondent, procédez à l'enregistrement
        const personneData = this.personneForm.value;
        this.loading = true;
        setTimeout(() => {
        this.authService.registerPersonne(personneData).subscribe(
          response => {
            this.personneForm.reset();
            this.loading = false;
            // Basculer vers le formulaire de connexion
            this.isRegisterFormVisible = false;

          },
          error => {
            console.error('Registration failed', error);
            this.errorMessage = 'Une erreur est survenu lors de l\'inscription '
            this.loading = false;
            // Handle registration error, e.g., show an error message
          }
        );}, 1000);
      } else {
        // Les mots de passe ne correspondent pas, afficher un message d'erreur
        this.passNotMatch = 'Les mots de passe ne correspondent pas.';
      }
    } else {
      // Le formulaire est invalide, gérer en conséquence (par exemple, afficher des messages de validation)
    }
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
        this.personneForm.patchValue({ adresse: place.formatted_address });
      }
    });

  }
}
