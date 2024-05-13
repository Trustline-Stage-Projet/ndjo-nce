import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-authentification',
  templateUrl: './authentification.component.html',
  styleUrls: ['./authentification.component.css']
})
export class AuthentificationComponent {

  personneForm: FormGroup;
  constructor(private fb: FormBuilder,private personneService: CrmService) {

    this.personneForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''],
      password: ['', Validators.required],
      repassword: ['', Validators.required],
      type_utilisateur: ['partenaire']
    });
   }

   registerPersonne() {
    if (this.personneForm.valid) {
      const personneData = this.personneForm.value;

      this.personneService.registerPersonne(personneData).subscribe(
        response => {
          console.log('Registration successful', response);
          // Handle successful registration, e.g., show a success message
        },
        error => {
          console.error('Registration failed', error);
          // Handle registration error, e.g., show an error message
        }
      );
    } else {
      // Form is invalid, handle accordingly (e.g., show validation messages)
    }
  }
}
