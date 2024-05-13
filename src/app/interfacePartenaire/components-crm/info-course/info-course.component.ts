import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-info-course',
  templateUrl: './info-course.component.html',
  styleUrls: ['./info-course.component.css']
})
export class InfoCourseComponent implements OnInit {
  reservation?: any;
  selectedType!: string;
  selectedSubType!: string;
  phone!: string
  data: any
  lieuxPriseEnChargeLat!: number;
  lieuxPriseEnChargeLng!: number;
  lieuxDestinationLat!: number;
  lieuxDestinationLng!: number;
  clientDetails: any;
  reservationId!: number;
  vehiculeData: any;
  loading: boolean = false;
  errorMessage!: string;
  successMessage!: string;
  startTime: string = '';
  startDate: string = '';
  endDate: string = '';
  endTime: string = '';
  location: string = '';
  description: string = '';
  title: string = '';
  sendData: boolean = false;
  showInitialCards = true;
  selectedCardType: string | null = null;
  selectedMainCardType!: string;
  @ViewChild('contentMsg') contentMsg!: TemplateRef<any>; // Référence à l'élément ng-template
  coutVente: any
  cout: any
  showResults: boolean = false;
  compensationEnabled = true;

  cards = [
    { type: 'pdf', title: 'PDF', subtitle: 'Télécharger en PDF', badgeClass: 'badge bg-label-danger rounded-circle p-2', icon: 'bx bxs-file-pdf bx-sm' },
    { type: 'mail', title: 'Mail', subtitle: 'Envoyer par Mail', badgeClass: 'badge bg-label-info rounded-circle p-2', icon: 'bx bx-mail-send bx-sm' },
    { type: 'whatsapp', title: 'WhatsApp', subtitle: 'Envoyer par WhatsApp', badgeClass: 'badge bg-label-success rounded-circle p-2', icon: 'bx bxl-whatsapp bx-sm' }
  ];

  cardsFille = [
    { type: 'commande', title: 'Bon', subtitle: 'De Commande', badgeClass: 'badge bg-label-primary rounded-circle p-2', icon: 'BC' },
    { type: 'disponibilite', title: 'Bon', subtitle: 'De Disponibilite', badgeClass: 'badge bg-label-warning rounded-circle p-2', icon: 'BD' },
    { type: 'annulation', title: 'Bon', subtitle: 'D\'Annulation', badgeClass: 'badge bg-label-danger rounded-circle p-2', icon: 'BA' }
  ];

  cardBonAnnulation = [
    { type: 'client', title: 'Client', subtitle: 'Bon d\'annulation pour client', badgeClass: 'badge bg-label-primary rounded-circle p-2', icon: 'Cl' },
    { type: 'chauffeur', title: 'Chauffeur', subtitle: 'Bon d\'annulation pour chauffeur', badgeClass: 'badge bg-label-warning rounded-circle p-2', icon: 'CH' },
    { type: 'autre', title: 'Autre', subtitle: 'Bon d\'annulation pour autre', badgeClass: 'badge bg-label-danger rounded-circle p-2', icon: 'AU' }
  ];

  cardBonCommande = [
    { type: 'client', title: 'Client', subtitle: 'Bon de commande pour client', badgeClass: 'badge bg-label-primary rounded-circle p-2', icon: 'CL' },
    { type: 'autre', title: 'Autre', subtitle: 'Bon de commande pour autre', badgeClass: 'badge bg-label-danger rounded-circle p-2', icon: 'AU' }
  ];

  cardBonDisponibilite = [
    { type: 'chauffeur', title: 'Chauffeur', subtitle: 'Bon de disponibilite pour chauffeur', badgeClass: 'badge bg-label-warning rounded-circle p-2', icon: 'CH' },
  ];

  calForm: FormGroup;
  telForm!: FormGroup;
  form!: FormGroup

  constructor(
    private _modalService: NgbModal,
    private _reservationService: CrmService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private http: HttpClient,
  ) {
    this.calForm = this.fb.group({
      commission: 10,
      compensation: 0,
      coutDeVente: 0,
    })
    this.telForm = this.fb.group({
      telephone: ['', [Validators.required, Validators.minLength(8)]],
    })
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.reservationId = +params['id']; // Assurez-vous que 'id' correspond à l'ID de la réservation dans vos routes
    });
    this.getReservation();
  }

  getReservation(): void {
    const id = this.route.snapshot.params['id'];
    this._reservationService.getReservation(id).subscribe((reservation) => {
      this.reservation = reservation;
      this.cout = reservation.coutDeVente

      this.getClientData();

      this.getVehiculeData();

      this.getCoordinates(this.reservation.lieuxPriseEnCharge).subscribe(priseEnChargeCoords => {
        this.lieuxPriseEnChargeLat = priseEnChargeCoords.lat;
        this.lieuxPriseEnChargeLng = priseEnChargeCoords.lng;

      });

      this.getCoordinates(this.reservation.lieuxDestination).subscribe(destinationCoords => {
        this.lieuxDestinationLat = destinationCoords.lat;
        this.lieuxDestinationLng = destinationCoords.lng;
      });


       // Convertir la date en chaîne de caractères
       const datePriseEnChargeString = reservation.datePriseEnCharge ? new Date(reservation.datePriseEnCharge).toISOString() : '';

       // Diviser la date en date et heure
       const dateParts = datePriseEnChargeString.split('T');
       this.startDate = dateParts[0]; // Partie date
       this.startTime = dateParts[1].substring(0, 5);

       if (reservation.dateRetour) {
         // Si la date de retour existe, utilisez-la pour endDate
         const dateRetourString = new Date(reservation.dateRetour).toISOString();
         const dateRetourParts = dateRetourString.split('T');
         this.endDate = dateRetourParts[0]; // Partie date de retour
         this.endTime = dateRetourParts[1].substring(0, 5); // Partie heure de retour au format HH:mm
       } else {
         // Sinon, utilisez la logique pour calculer endDate et endTime
         this.endDate = this.startDate;
         this.endTime = this.calculateEndTime(this.startTime);
       }

      if (reservation.dateRetour) {
        // Si la date de retour existe, utilisez-la pour endDate
        const dateRetourString = new Date(reservation.dateRetour).toISOString();
        const dateRetourParts = dateRetourString.split('T');
        this.endDate = dateRetourParts[0]; // Partie date de retour
        this.endTime = dateRetourParts[1].substring(0, 5); // Partie heure de retour au format HH:mm
      } else {
        // Sinon, utilisez la logique pour calculer endDate et endTime
        this.endDate = this.startDate;
        this.endTime = this.calculateEndTime(this.startTime);
      }

      const vehicule = reservation.typeReservation !== null && reservation.typeReservation !== 'nan' ? reservation.typeReservation : '???';
      const numero_reservation = reservation.numero_reservation !== null ? reservation.numero_reservation : reservation.id;
      const lieux = reservation.lieuxPriseEnCharge !== null ? reservation.lieuxPriseEnCharge : 'lyon, France';

       // Mettre à jour les propriétés avec les valeurs récupérées
       this.title = numero_reservation + vehicule;
       this.location = lieux;
       const tarifValue = typeof reservation.coutTotalReservation === 'number' && !isNaN(reservation.coutTotalReservation)
         ? reservation.coutTotalReservation.toString()
         : '???';
       const formattedDatePriseEnCharge = reservation.datePriseEnCharge ? this.datePipe.transform(reservation.datePriseEnCharge, 'dd MMMM yyyy - HH:mm', 'fr') : '???';

       this._reservationService.getVehiculeDetail(this.reservation.vehicule).subscribe(
         (vehicule) => {
           this.vehiculeData = vehicule;

           const formattedVehicule = `${this.vehiculeData.marque} ${this.vehiculeData.modele} (${this.vehiculeData.typeVehicule})`;
           this._reservationService.getClientDetails(this.reservation.utilisateur).subscribe((data) => {
             this.clientDetails = data;

             // Créez la description
             this.description = `
             <div class="reservation-details">
               <h2>Détails de la réservation :</h2>
                 <p>Date et Heure: ${formattedDatePriseEnCharge}</p>
                 <p>Adresse de départ : ${reservation.lieuxPriseEnCharge ? reservation.lieuxPriseEnCharge : '???'}</p>
                 <p>Adresse de destination : ${reservation.lieuxDestination ? reservation.lieuxDestination : '???'}</p>
                 <p>Nombre de passagers : ${reservation.nombrePassager ? reservation.nombrePassager.toString() : '???'}</p>
                 <p>Nombre de bagages : ${reservation.nombreBagage ? reservation.nombreBagage.toString() : '???'}</p>
                 <p>Numéro de vol ou de train : ${reservation.compagnieAerienne !== null && reservation.compagnieAerienne !== 'nan' ? reservation.compagnieAerienne : '???'}</p>
                 <p>Vehicule :${formattedVehicule}</p>
                 <p>Tarif de la course : ${tarifValue !== 'nan' ? tarifValue : '???'}€</p>
             </div>
             <div class="client-info">
               <h2>Informations du client :</h2>
                 <p>Nom : ${data.last_name ? data.last_name : '???'} ${data.first_name ? data.first_name : ''}</p>
                 <p>Contact : ${data.telephone ? data.telephone : '???'}</p>
                 <p>E-mail : ${data.email ? data.email : '???'}</p>
             </div> `;

           });


         },
       );


    });
  }


  getCoordinates(address: string) {
    const apiKey = 'AIzaSyBEilIuILbArteSd2h21UUMcTsolLJiQPw'; // Remplacez par votre clé API Google Maps
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    return this.http.get(geocodingUrl).pipe(
      map((response: any) => {
        if (response.results && response.results.length > 0) {
          const location = response.results[0].geometry.location;
          return location;
        }
        return null;
      })
    );
  }

  calculateEndTime(startTime: string): string {
    // Séparez l'heure et les minutes de startTime
    const [startHour, startMinute] = startTime.split(':');

    // Convertissez-les en nombres
    const startHourNum = parseInt(startHour, 10);
    const startMinuteNum = parseInt(startMinute, 10);

    // Ajoutez 1 heure et 30 minutes
    let endHourNum = startHourNum + 1;
    let endMinuteNum = startMinuteNum + 30;

    // Gérez le cas où les minutes dépassent 60
    if (endMinuteNum >= 60) {
      endHourNum++;
      endMinuteNum -= 60;
    }

    // Convertissez les heures et minutes en chaîne de caractères
    const endHour = endHourNum.toString().padStart(2, '0'); // Assurez-vous qu'il a toujours 2 chiffres
    const endMinute = endMinuteNum.toString().padStart(2, '0'); // Assurez-vous qu'il a toujours 2 chiffres

    // Créez endTime au format "HH:mm"
    const endTime = `${endHour}:${endMinute}`;

    return endTime;
  }

  getVehiculeData() {
    this._reservationService
      .getVehiculeDetail(this.reservation.vehicule)
      .subscribe((vehicule) => {
        this.vehiculeData = vehicule;
      });
  }

  getClientData() {
    this._reservationService
      .getClientDetails(this.reservation.utilisateur)
      .subscribe((data) => {
        this.clientDetails = data;
      });
  }

  openConfirmationModal(content: any, msg: any, reservationId: any) {
    this._modalService
      .open(content, { centered: true, ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          if (result === 'confirm') {
            this.loading = true;
            this.notifier(reservationId, msg);
          }
        },
        (reason) => {
          // Modal closed without confirming (cancel or backdrop click)
        }
      );
  }

  toggleSendMode() {
    this.sendData = !this.sendData;
  }

  notifier(reservationId: number, msg: any) {
    setTimeout(() => {
      this._reservationService.notifierRefus(reservationId).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Refus notifié avec succès.', response);
          // Vous pouvez ajouter des actions supplémentaires ici, par exemple, afficher une notification à l'utilisateur
          this.successMessage = 'la course a ete annuler avec success';
          this._modalService.open(msg, { centered: true });
          this.router.navigate(['/course']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur lors de la notification de refus', error);
          this.errorMessage =
            "une erreur est survenu lors de l'annulation de la reservation ";
          this._modalService.open(msg, { centered: true });
          // Gestion de l'erreur, par exemple, afficher un message d'erreur à l'utilisateur
        },
      });
    }, 1000);
  }

    // Ajoutez un paramètre pour indiquer si la sélection est une carte principale
    selectCard(cardType: string, isMainCard: boolean = false): void {
      if (isMainCard) {
        // Si c'est une carte principale, stockez son type dans selectedMainCardType
        this.selectedMainCardType = cardType;
        this.selectedCardType = cardType;

      } else {
        // Sinon, c'est une sélection de carte fille, stockez son type dans selectedCardType
        this.selectedCardType = cardType;
      }
      this.showInitialCards = false;
    }


    resetView(): void {
      this.showInitialCards = true;
      this.selectedCardType = null;
    }


    getSubCards(selectedType: string): any[] {
      switch (selectedType) {
        case 'annulation':
          return this.cardBonAnnulation;
        case 'commande':
          return this.cardBonCommande;
        case 'disponibilite':
          return this.cardBonDisponibilite;
        default:
          return [];
      }
    }

    generatePDF(pdfType: string, content: any): void {
      this.loading = true;

      switch (pdfType) {
        case 'commande':
          setTimeout(() => {
            this._reservationService.generatePDF(this.reservationId).subscribe({
              next: (data) => {
                this.downloadPDF(data, 'commande');
                // Ouvrir le modal ici après le succès de la requête
                this.loading = false;
                this._modalService.open(content, { centered: true });
                this.successMessage = "Le Bon de commande est generer avec success";

              },
              error: (error) => {
                // Gérer l'erreur ici si nécessaire
                this.errorMessage = "Erreur lors de la génération du PDF de commande";
                this.loading = false;

              }
            });
          }, 1000);
          break;
        case 'disponibilite':
          setTimeout(() => {
            this._reservationService.BonDeDisponibilitePDF(this.reservationId).subscribe({
              next: (data) => {
                this.downloadPDF(data, 'disponibilite');
                // Ouvrir le modal ici après le succès de la requête
                this.loading = false;
                this._modalService.open(content, { centered: true });
                this.successMessage = "Le Bon de disponibilité est generer avec success";

              },
              error: (error) => {
                // Gérer l'erreur ici si nécessaire
                this.loading = false;
                this.errorMessage = "Erreur lors de la génération du PDF de disponibilité";
              }
            });
          }, 1000);
          break;
        case 'annulation':
          setTimeout(() => {
            this._reservationService.BonAnnulationPDF(this.reservationId).subscribe({
              next: (data) => {
                this.downloadPDF(data, 'annulation');
                // Ouvrir le modal ici après le succès de la requête
                this.loading = false;
                this._modalService.open(content, { centered: true });
                this.successMessage = "Le Bon d'annulation est generer avec success";

              },
              error: (error) => {
                // Gérer l'erreur ici si nécessaire
                this.loading = false;
                this.errorMessage = "Erreur lors de la génération du PDF d'annulation";

              }
            });
          }, 1000);
          break;
      }
    }

    downloadPDF(data: any, pdfType: string): void {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfType}_0${this.reservationId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    }


    openConfirmationModal2(contenu: any, selectedType: any, subCardType: any) {
      this.selectedType = '';
      this.selectedSubType = '';

      this.selectedType = selectedType;
      this.selectedSubType = subCardType;
      this._modalService.open(contenu, { centered: true }).result.then((result) => {
        this._modalService.dismissAll();
        if (result === 'confirm') {
          this.WhatsApp(selectedType, subCardType)
        } else {
          // Réinitialiser la valeur de this.telForm.get('telephone')?.value ici
          this.telForm.get('telephone')?.setValue('');
        }
      }, (reason) => {
        this.telForm.get('telephone')?.setValue('');
      });
    }

    dataModal(Content5: any, selectedType: any, subCardType: any) {
      this.selectedType = '';
      this.selectedSubType = '';

      this.selectedType = selectedType;
      this.selectedSubType = subCardType;
      this._modalService.open(Content5, { centered: true });
    }


    WhatsApp(selectedType: any, subCardType: any): void {
      if (selectedType && subCardType) {
        const text = this.genererFichierTXT(selectedType);
        const message = `Info de la Reservation:\n${text}`;
        const encodedMessage = encodeURIComponent(message);
        if (this.reservation) {
          let phoneNumber = ''
          // Sélectionnez le numéro en fonction du type de personne
          switch (subCardType) {
            case 'chauffeur':
              phoneNumber = this.telForm.get('telephone')?.value;
              break;
            case 'client':
              phoneNumber = this.clientDetails.telephone;
              break;
            case 'autre':
              phoneNumber = this.telForm.get('telephone')?.value;
              break;
            default:
              console.log('Type de personne non spécifié.');
              return;
          }
          const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
          window.open(url, '_blank');
          this.telForm.get('telephone')?.setValue('');
        }
      } else {
        console.log('Veuillez sélectionner un type de bon et un type de personne.');
        this.telForm.get('telephone')?.setValue('');
      }
    }

    Modal() {
      this._modalService.open(this.contentMsg, { centered: true });
    }

    Email(selectedType: any, subCardType: any): void {
      if (selectedType && subCardType) {
        if (this.reservation) {
          let email: string;
          // Sélectionnez le numéro en fonction du type de personne
          switch (subCardType) {
            case 'chauffeur':
              email = this.form.get('email')?.value; // Envoyer à l'e-mail du client
              break;
            case 'client':
              email = this.clientDetails.email;
              break;
            case 'autre':
              email = this.form.get('email')?.value;
              break;
            default:
              console.log('Type de personne non spécifié.');
              return;
          }
          this.loading = true;
          setTimeout(() => {
            this._reservationService.sendEmail(selectedType, this.reservationId, email).subscribe(
              (response) => {
                // Fermer le modal après l'envoi de l'e-mail
                this.form.reset()
                this.Modal()
                this.successMessage = response.message;
                this.loading = false;
              },
              (error) => {
                console.error('Error sending email:', error);
                // Handle the error response here if needed
                this._modalService.dismissAll();
                this.Modal()
                this.errorMessage = error.error.message;
                this.loading = false;
              }
            );

          }, 1000);
        }
      } else {
        console.log('Veuillez sélectionner un type de bon et un type de personne.');
        this.form.reset()
      }
    }

    openConfirmModal(contenu: any, selectedType: any, subCardType: any) {
      this.selectedType = '';
      this.selectedSubType = '';

      this.selectedType = selectedType;
      this.selectedSubType = subCardType;
      this._modalService.open(contenu, { centered: true }).result.then((result) => {
        this._modalService.dismissAll();
        if (result === 'confirm') {
          this.Email(selectedType, subCardType)
        } else {
          // Réinitialiser la valeur de this.telForm.get('telephone')?.value ici
          this.form.reset()
        }
      }, (reason) => {
        this.form.reset()
      });
    }

    genererFichierTXT(typeBon: string): string {
      let formattedText = '';
      const usr = this.clientDetails

      switch (typeBon) {
        case 'commande':
          formattedText += `
        BON DE COMMANDE

        Service de voiture de transport avec chauffeur
        Billet collectif : Arrêté du 14 Février 1986 - Article 5 Ordre de mission : Arrêté du 6 Janvier 1993 - Article 3
        Location de véhicule avec chauffeur

        Course: ${this.reservation.lieuxPriseEnCharge || ''} --> ${this.reservation.lieuxDestination || ''}
        Date de Départ : ${this.formatterDate(this.reservation.datePriseEnCharge) || ''}
        Date de Retour :${this.formatterDate(this.reservation.dateRetour) || '???'}
        Type de véhicule : ${this.reservation.typeReservation || ''}
        Nom : ${usr.last_name || '???'} ${usr.first_name || ''}
        Coordonnées : ${usr.telephone || '???'} (${usr.email || '???'})
        Mode de paiement : ${this.reservation.modePaiement || '???'}
        Prix de la Réservation : ${this.reservation.coutTotalReservation || '???'}€

        Le tarif ci-dessus inclus toutes les charges: Parking, péage et attente du chauffeur à la prise en charge (15 minutes à la gare, 60 minutes à l'aéroport et 15 minutes aux autres adresses).
        Au delà de ce temps d’attente , le client est notifié avant le décompte du temps Additionnel facturé.Les retards de train et d’avion ne sont pas facturés.
          `;
          break;
        case 'disponibilite':
          formattedText += `
          Bon de Disponibilité
          Pourriez-vous confirmer votre disponibilité pour la course à venir, dont les détails suivent ?
          Course: ${this.reservation.lieuxPriseEnCharge || ''} --> ${this.reservation.lieuxDestination || ''}
          Date de Départ : ${this.formatterDate(this.reservation.datePriseEnCharge) || ''}
          Date de Retour :${this.formatterDate(this.reservation.dateRetour) || '???'}
          Type de véhicule : ${this.reservation.typeReservation || ''}
          Prix de la course : ${this.reservation.coutDeVente || '???'}€
          `;
          break;
        case 'annulation':
          formattedText += `
          Bon d'Annulation
          Comme mentionné dans les conditions en bas de la page, en raison
          de certains inconvénients, la course, dont les informations suivent, est annulée
          Course: ${this.reservation.lieuxPriseEnCharge || ''} --> ${this.reservation.lieuxDestination || ''}
          Date de Départ : ${this.formatterDate(this.reservation.datePriseEnCharge) || ''}
          Date de Retour :${this.formatterDate(this.reservation.dateRetour) || '???'}
          Type de véhicule : ${this.reservation.typeReservation || ''}
          Prix de la course : ${this.reservation.coutTotalReservation || '???'}€
          `;
          break;
        default:
          formattedText = 'Type de bon non spécifié.';
          break;
      }

      return formattedText;
    }

    formatterDate(date: string): string {
      if (date) {
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        return new Date(date).toLocaleDateString('fr-FR', options);
      } else {
        return '???';
      }
    }

    reload() {
      window.location.reload()
    }

    compenserCourse() {
      this.compensationEnabled = true;
      this.calForm.get('compensation')?.reset(); // Réinitialisez la valeur de compensation (si nécessaire)
    }

    appliquerCommission() {
      this.compensationEnabled = false;
      this.calForm.get('commission')?.reset(); // Réinitialisez la valeur de commission (si nécessaire)
    }

    calculate() {
      if (this.compensationEnabled) {
        this.coutVente = this.cout + this.calForm.value.compensation;

      } else {
        const commission = this.cout * (this.calForm.value.commission / 100);
        this.coutVente = this.cout - commission;

      }
      this.showResults = true;
    }
    uploadCalcul() {
      const Data = {
        ...this.data,
        prixVentePartenaire: this.coutVente,
        commission: this.calForm.get('commission')?.value,
        compensation: this.calForm.get('compensation')?.value,

      };
      this._reservationService.updateReservation(this.data.id, Data).subscribe((updated) => {
      });
    }
    retour() {
      this.calForm.patchValue({
        commission: 10, // Remplacez null par la valeur par défaut de la commission si elle existe
        compensation: 0, // Remplacez null par la valeur par défaut de la compensation si elle existe
      });
      this.showResults = false
    }

    openModal(content: any) {
      this._modalService.open(content, { centered: true });
    }
}
