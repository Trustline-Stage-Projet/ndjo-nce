import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuthData } from '../models/user';
import {
  Attribut,
  AutrePayement,
  CleAPI,
  Compteur,
  ConfigDevis,
  ConfigFacture,
  ConfigurationDeBase,
  Log,
  MethodePayement,
  Parametres,
  PayPal,
  Stripe,
  TypeVehicule,
  VirementBancaire,
} from '../models/parametres';
import { Entreprise, Vehicule, Prix, Chauffeur } from '../models/gve';

@Injectable({
  providedIn: 'root',
})
export class CrmService {
  private url: string = 'http://localhost:8000/api/';
  private gveUrl: string = 'http://localhost:8000/api/gve/';
  private settingUrl: string = 'http://localhost:8000/api/setting/';
  private reservationUrl: string = 'http://localhost:8000/api/reservations/';
  private estimationUrl: string = 'http://localhost:8000/api/estimation/';

  // private url: string = 'https://hpcrm.pythonanywhere.com/api/';
  // private reservationUrl: string = 'https://hpcrm.pythonanywhere.com/api/reservations/';
  // private factureUrl: string = 'https://hpcrm.pythonanywhere.com/factures/';
  // private gveUrl: string = 'https://hpcrm.pythonanywhere.com/api/gve/';
  // private settingUrl: string = 'https://hpcrm.pythonanywhere.com/api/setting/';
  // private articlesgUrl: string = 'https://hpcrm.pythonanywhere.com/api/web/';

  constructor(private http: HttpClient) {}

  //  service connexion

  getUserType(): string {
    return localStorage.getItem('userType') || ''; // Fournit une chaîne vide comme valeur par défaut si null
  }

  isUserAuthenticated(): boolean {
    const token = localStorage.getItem('access_token'); // Exemple avec localStorage
    return token !== null;
  }

  ReserverList(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.reservationUrl, { headers });
  }

    // service de mise a jour de reservation
    updateReservation(id: number, reservation: any): Observable<any> {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.put<any>(`${this.reservationUrl}${id}/ `, reservation);
    }

  searchReservations(searchTerm: string): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(
      `${this.estimationUrl}search/?search=${searchTerm}`,
      { headers }
    );
  }
  envoyerEmailReservation(reservationId: number, data: { utilisateur_id?: number, email?: string }): Observable<any> {
    const url = `${this.url}envoyer-email/${reservationId}/`;
    return this.http.post(url, data);
  }

  getClientDetails(clientId: number): Observable<any> {
    // const token = localStorage.getItem('access_token');
    // const headers = new HttpHeaders({
    //   'Authorization': `Bearer ${token}`
    // });
    return this.http.get(this.url + 'auth/clients/' + clientId + '/');
  }

  getChauffeurDetails(userId: any): Observable<any> {
    return this.http.get(`${this.url}auth/chauffeur/${userId}/`);
  }


  getReservationsByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.reservationUrl}utilisateur/${userId}/`);
  }

  login(authData: AuthData): Observable<any> {
    return this.http.post(this.url + 'auth/login/', authData).pipe(
      tap((response: any) => {
        // Stockez le jeton d'authentification dans le local storage
        localStorage.setItem('access_token', response.jwt);
        localStorage.setItem('refresh_token', response.refresh);
      })
    );
  }

  sendRegistrationEmail(clientData: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(
      `${this.url}auth/send-registration-email/`,
      clientData,
      { headers }
    );
  }

  registerPersonne(personneData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>(this.url + 'auth/register/', personneData, {
      headers,
    });
  }
  // logout(): Observable<any> {
  //   const token = localStorage.getItem('access_token');
  //   const refresh = localStorage.getItem('refresh_token');
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${token}`
  //   });
  //   const body = { refresh_token: refresh };

  //   return this.http.post<any>(`${this.url}auth/logout/`, body ,{headers});
  // }

  sendPasswordResetRequest(emailOrPhone: string): Observable<any> {
    const requestData = { email_or_phone: emailOrPhone };
    return this.http.post<any>(
      this.url + 'auth/password/reset/request/',
      requestData
    );
  }

  verifyPasswordReset(
    email: string,
    verificationCode: string
  ): Observable<any> {
    const requestData = { email, verification_code: verificationCode };
    return this.http.post<any>(
      this.url + 'auth/password/reset/control/',
      requestData
    );
  }

  resetPassword(
    email: string,
    newPassword: string,
    confirmNewPassword: string
  ): Observable<any> {
    const requestData = {
      email,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword,
    };
    return this.http.post<any>(this.url + 'auth/password/reset/', requestData);
  }

  partenaireList(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.url}auth/partenaires/`, { headers });
  }

  logout(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(`${this.url}auth/logout/`, { headers });
  }

  getUserInfo() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(`${this.url}auth/user/me/`, { headers });
  }

  getChauffeursParPartenaire(user_id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}auth/chauffeurs-par-partenaire/${user_id}/`);
  }

    // service de generation de reservation
    generatePDF(reservationId: number): Observable<any> {
      const token = localStorage.getItem('access_token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      const url = `${this.url}reservation/pdf/${reservationId}/`;
      return this.http.get(url, { responseType: 'blob', headers });
    }

      // service de generation de reservation
  BonDeDisponibilitePDF(reservationId: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `${this.url}demandeDeDisponibilite/pdf/${reservationId}/`;
    return this.http.get(url, { responseType: 'blob', headers });
  }
  // service de generation de reservation
  BonAnnulationPDF(reservationId: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `${this.url}bonDannulation/pdf/${reservationId}/`;
    return this.http.get(url, { responseType: 'blob', headers });
  }

  sendEmail(emailType: string, id: number, recipientEmail: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    const url = `${this.url}send-email/${emailType}/${id}/`;
    const data = { recipient_email: recipientEmail };

    return this.http.post(url, data, { headers });
  }

  PersonnalUpdateChauffeur(
    user_id: number,
    chauffeurData: any
  ): Observable<any> {
    const url = `${this.url}auth/chauffeur/update/${user_id}/`;
    return this.http.put(url, chauffeurData);
  }
  // gve service

  // Entreprises
  getEntreprises(): Observable<Entreprise[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Entreprise[]>(this.gveUrl + 'entreprises/', {
      headers,
    });
  }

  getEntreprisesPartenaire(): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(this.gveUrl + 'infos/', { headers });
  }

  getEntrepriseDetail(id: number): Observable<Entreprise> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Entreprise>(this.gveUrl + 'entreprises/' + id + '/', {
      headers,
    });
  }

  getPaymentMethods(): Observable<any[]> {
    return this.http.get<any[]>(`${this.settingUrl}methodesPaiement/`);
  }

  // registerUser(userData: any): Observable<any> {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //   });

  //   return this.http.post<any>(this.url + 'auth/register/', userData, { headers });
  // }

  registerUser(userData: any): Observable<any> {
    // Déterminer si userData est une instance de FormData
    if (userData instanceof FormData) {
      // Pour FormData, ne pas définir 'Content-Type' dans les headers
      // Le navigateur s'en chargera et inclura la limite nécessaire pour le multipart
      return this.http.post<any>(this.url + 'auth/register/', userData);
    } else {
      // Pour JSON, définir 'Content-Type' à 'application/json'
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });
      return this.http.post<any>(
        this.url + 'auth/register/',
        JSON.stringify(userData),
        { headers }
      );
    }
  }

  associerChauffeurEntreprise(data: {
    user_id: number;
    entreprise_key: string;
  }): Observable<any> {
    return this.http.post(
      this.url + 'auth/associer-chauffeur-entreprise/',
      data
    );
  }

  notifierRefus(reservationId: number): Observable<any> {
    return this.http.post<any>(`${this.url}notifier-refus/${reservationId}/`, {});
  }

  deactivateChauffeurAccount(userId: number): Observable<any> {
    return this.http.post(this.url + 'auth/deactivate-chauffeur-account/', {
      user_id: userId,
    });
  }

  createMonEntreprise(formData: FormData): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(this.gveUrl + 'addMonEntreprise/', formData, {
      headers,
    });
  }

  createEntreprise(formData: FormData): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(this.gveUrl + 'addEntrepisePartemaire/', formData, {
      headers,
    });
  }
  getDerniereEntreprise(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.gveUrl + 'lastEntreprise/', { headers });
  }

  updateEntreprise(id: number, entreprise: FormData): Observable<Entreprise> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<Entreprise>(
      this.gveUrl + 'entreprises/' + id + '/',
      entreprise,
      { headers }
    );
  }

  deleteEntreprise(id: number): Observable<void> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<void>(this.gveUrl + 'entreprises/' + id + '/', {
      headers,
    });
  }

  // Véhicules
  getVehicules(): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(this.gveUrl + 'vehicules/', { headers });
  }

  getVehiculeDetail(id: number): Observable<Vehicule> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Vehicule>(this.gveUrl + 'vehicules/' + id + '/', {
      headers,
    });
  }

  getReservation(id: number): Observable<any> {
    // const token = localStorage.getItem('access_token');
    // const headers = new HttpHeaders({
    //   'Authorization': `Bearer ${token}`
    // });
    return this.http.get<any>(`${this.reservationUrl}${id}/`);
  }

  getVehiculesForEntreprise(entrepriseId: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const url = `${this.gveUrl}vehiculesEntreprise/${entrepriseId}/`;
    return this.http.get(url, { headers });
  }

  getChauffeursForEntreprise(entrepriseId: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const url = `${this.gveUrl}chauffeursEntreprise/${entrepriseId}/`;
    return this.http.get(url, { headers });
  }

  createVehicule(formData: FormData): Observable<Vehicule> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<Vehicule>(this.gveUrl + 'vehicules/', formData, {
      headers,
    });
  }

  updateVehicule(id: number, vehicule: FormData): Observable<Vehicule> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<Vehicule>(
      this.gveUrl + 'vehiculesUpdate/' + id + '/',
      vehicule,
      { headers }
    );
  }

  deleteVehicule(id: number): Observable<void> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<void>(this.gveUrl + 'vehicules/' + id + '/', {
      headers,
    });
  }

  // Prix
  getPrix(): Observable<Prix[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Prix[]>(this.gveUrl + 'prix/', { headers });
  }

  getPrixDetail(id: number): Observable<Prix> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Prix>(this.gveUrl + 'prix/' + id + '/', { headers });
  }

  createPrix(prix: Prix): Observable<Prix> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<Prix>(this.gveUrl + 'prix/', prix, { headers });
  }

  updatePrix(id: number, prix: Prix): Observable<Prix> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<Prix>(this.gveUrl + 'updatePrix/' + id + '/', prix, {
      headers,
    });
  }

  deletePrix(id: number): Observable<void> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<void>(this.gveUrl + 'prix/' + id + '/', {
      headers,
    });
  }

  // Chauffeurs
  getChauffeurs(): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(this.gveUrl + 'chauffeurs/', { headers });
  }

  getChauffeurDetail(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Chauffeur>(this.gveUrl + 'chauffeurs/' + id + '/', {
      headers,
    });
  }

  // createChauffeur(formData: FormData): Observable<Chauffeur> {
  //   // const token = localStorage.getItem('access_token');
  //   // const headers = new HttpHeaders({
  //   //   'Authorization': `Bearer ${token}`
  //   // });
  //   return this.http.post<Chauffeur>(this.gveUrl + 'chauffeurs/', formData, { headers });
  // }

  // updateChauffeur(id: number, chauffeur: FormData): Observable<Chauffeur> {
  //   const token = localStorage.getItem('access_token');
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${token}`,
  //   });
  //   return this.http.put<Chauffeur>(
  //     this.gveUrl + 'chauffeursUpdate/' + id + '/',
  //     chauffeur,
  //     { headers }
  //   );
  // }

  deleteChauffeur(id: number): Observable<void> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<void>(this.gveUrl + 'chauffeurs/' + id + '/', {
      headers,
    });
  }

  // setting services

  addParametres(Parametres: Parametres): Observable<Parametres> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<Parametres>(
      this.settingUrl + 'parametres/',
      Parametres,
      { headers }
    );
  }
  addAttribut(attribut: Attribut): Observable<Attribut> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<Attribut>(
      this.settingUrl + 'attributs/create/',
      attribut,
      { headers }
    );
  }
  addTypeVehicule(type: TypeVehicule): Observable<TypeVehicule> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<TypeVehicule>(
      this.settingUrl + 'typeVehicules/',
      type,
      { headers }
    );
  }
  addAutrePayement(autre: AutrePayement): Observable<AutrePayement> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<AutrePayement>(
      this.settingUrl + 'autrePayement/',
      autre,
      { headers }
    );
  }
  addApi(api: CleAPI): Observable<CleAPI> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<CleAPI>(this.settingUrl + 'clesApi/', api, {
      headers,
    });
  }

  addVirement(virementData: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(
      this.settingUrl + 'virement/create/',
      virementData,
      { headers }
    );
  }

  addPaypal(paypal: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + 'paypal/', paypal, {
      headers,
    });
  }
  addStripe(stripe: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + 'stripe/create/', stripe, {
      headers,
    });
  }

  addConfigFacture(configFacture: ConfigFacture): Observable<ConfigFacture> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<ConfigFacture>(
      this.settingUrl + 'configFacture/',
      configFacture,
      { headers }
    );
  }

  addConfigDevis(configDevis: ConfigDevis): Observable<ConfigDevis> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<ConfigDevis>(
      this.settingUrl + 'configDevis/',
      configDevis,
      { headers }
    );
  }

  addCompteur(compteur: Compteur): Observable<Compteur> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<Compteur>(this.settingUrl + 'compteur/', compteur, {
      headers,
    });
  }

  addInfoUser(infoUser: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + 'infoUser/', infoUser, {
      headers,
    });
  }
  // service de recuperation de la liste de Parametres
  getAllParametres(): Observable<Parametres[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Parametres[]>(this.settingUrl + 'parametres/', {
      headers,
    });
  }
  getAllAttribut(): Observable<Attribut[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Attribut[]>(this.settingUrl + 'attributs/', {
      headers,
    });
  }
  getAllTypeVehicule(): Observable<TypeVehicule[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<TypeVehicule[]>(this.settingUrl + 'typeVehicules/', {
      headers,
    });
  }
  getAllMethodePayement(): Observable<MethodePayement[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<MethodePayement[]>(
      this.settingUrl + 'mehtodePayement/',
      { headers }
    );
  }
  getAllAutrePayement(): Observable<AutrePayement[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<AutrePayement[]>(this.settingUrl + 'autrePayement/', {
      headers,
    });
  }
  getAllApi(): Observable<CleAPI[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<CleAPI[]>(this.settingUrl + 'clesApi/', { headers });
  }
  getAllConfBase(): Observable<ConfigurationDeBase[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<ConfigurationDeBase[]>(
      this.settingUrl + 'configurationsDeBase/',
      { headers }
    );
  }
  getAllVirement(): Observable<VirementBancaire[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<VirementBancaire[]>(
      this.settingUrl + 'virementBancaire/',
      { headers }
    );
  }
  getAllPaypal(): Observable<PayPal[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<PayPal[]>(this.settingUrl + 'paypal/', { headers });
  }
  getAllStripe(): Observable<Stripe[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Stripe[]>(this.settingUrl + 'stripe/', { headers });
  }

  getAllConfigFacture(): Observable<ConfigFacture[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<ConfigFacture[]>(this.settingUrl + 'configFacture/', {
      headers,
    });
  }

  getAllConfigDevis(): Observable<ConfigDevis[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<ConfigDevis[]>(this.settingUrl + 'configDevis/', {
      headers,
    });
  }

  getAllInfoUser(): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(this.settingUrl + 'infoUser/', { headers });
  }

  // service de recuperation de Parametres par id
  getParametre(id: number): Observable<Parametres> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Parametres>(
      this.settingUrl + 'ParametresDetail/' + id + '/',
      { headers }
    );
  }
  getAttribut(id: number): Observable<Attribut> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Attribut>(this.settingUrl + 'attributs/' + id + '/', {
      headers,
    });
  }
  getTypeVehicule(id: number): Observable<TypeVehicule> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<TypeVehicule>(
      this.settingUrl + 'typeVehicules/' + id + '/',
      { headers }
    );
  }
  getMethodePayement(id: number): Observable<MethodePayement> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<MethodePayement>(
      this.settingUrl + 'methodesPaiement/' + id + '/',
      { headers }
    );
  }
  getVirement(id: number): Observable<VirementBancaire> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<VirementBancaire>(
      this.settingUrl + 'virementBancaire/' + id + '/',
      { headers }
    );
  }
  getPaypal(id: number): Observable<PayPal> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<PayPal>(this.settingUrl + 'paypal/' + id + '/', {
      headers,
    });
  }
  getStripe(id: number): Observable<Stripe> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Stripe>(this.settingUrl + 'stripe/' + id + '/', {
      headers,
    });
  }
  getAutrePayement(id: number): Observable<AutrePayement> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<AutrePayement>(
      this.settingUrl + 'autrePayement/' + id + '/',
      { headers }
    );
  }
  getCleApi(id: number): Observable<CleAPI> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<CleAPI>(this.settingUrl + 'clesApi/' + id + '/', {
      headers,
    });
  }
  getConfBase(id: number): Observable<ConfigurationDeBase> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<ConfigurationDeBase>(
      this.settingUrl + 'configurationsDeBase/' + id + '/',
      { headers }
    );
  }

  getConfigFacture(id: number): Observable<ConfigFacture> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<ConfigFacture>(
      this.settingUrl + 'configFacture/' + id + '/',
      { headers }
    );
  }

  getConfigDevis(id: number): Observable<ConfigDevis> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<ConfigDevis>(
      this.settingUrl + 'configDevis/' + id + '/',
      { headers }
    );
  }

  getCompteur(id: number): Observable<Compteur> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<Compteur>(this.settingUrl + 'compteur/' + id + '/', {
      headers,
    });
  }

  getInfoUser(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.settingUrl + 'infoUser/' + id + '/', {
      headers,
    });
  }

  // service de mise a jour de Parametres
  updateParametres(id: number, Parametres: Parametres): Observable<Parametres> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<Parametres>(
      this.settingUrl + 'ParametresDetail/' + id + '/',
      Parametres,
      { headers }
    );
  }
  updateAttribut(id: number, attribut: Attribut): Observable<Attribut> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<Attribut>(
      this.settingUrl + 'attributs/' + id + '/',
      attribut,
      { headers }
    );
  }
  updateTypeVehicule(id: number, type: TypeVehicule): Observable<TypeVehicule> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<TypeVehicule>(
      this.settingUrl + 'typeVehicules/' + id + '/',
      type,
      { headers }
    );
  }
  updateMethodePayement(
    id: number,
    mode: MethodePayement
  ): Observable<MethodePayement> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<MethodePayement>(
      this.settingUrl + 'methodesPaiement/' + id + '/',
      mode,
      { headers }
    );
  }
  updateConfBase(
    id: number,
    conf: ConfigurationDeBase
  ): Observable<ConfigurationDeBase> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<ConfigurationDeBase>(
      this.settingUrl + 'configurationsDeBase/' + id + '/',
      conf,
      { headers }
    );
  }
  updateVirement(id: number, data: FormData): Observable<VirementBancaire> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<VirementBancaire>(
      this.settingUrl + 'virementBancaire/' + id + '/',
      data,
      { headers }
    );
  }
  updatePayPal(id: number, data: FormData): Observable<PayPal> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<PayPal>(this.settingUrl + 'paypal/' + id + '/', data, {
      headers,
    });
  }
  updateStripe(id: number, data: FormData): Observable<Stripe> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<Stripe>(this.settingUrl + 'stripe/' + id + '/', data, {
      headers,
    });
  }
  updateAutrePayement(
    id: number,
    autre: AutrePayement
  ): Observable<AutrePayement> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<AutrePayement>(
      this.settingUrl + 'autrePayement/' + id + '/',
      autre,
      { headers }
    );
  }
  updateApi(id: number, api: CleAPI): Observable<CleAPI> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<CleAPI>(this.settingUrl + 'clesApi/' + id + '/', api, {
      headers,
    });
  }

  updateConfigFacture(
    id: number,
    configFacture: ConfigFacture
  ): Observable<ConfigFacture> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<ConfigFacture>(
      this.settingUrl + 'configFacture/' + id + '/',
      configFacture,
      { headers }
    );
  }

  updateConfigDevis(
    id: number,
    configDevis: ConfigDevis
  ): Observable<ConfigDevis> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<ConfigDevis>(
      this.settingUrl + 'configDevis/' + id + '/',
      configDevis,
      { headers }
    );
  }

  updateCompteur(id: number, compteur: Compteur): Observable<Compteur> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<Compteur>(
      this.settingUrl + 'compteur/' + id + '/',
      compteur,
      { headers }
    );
  }

  updateInfoUser(infoUser: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(this.settingUrl + 'infoUser/update/', infoUser, {
      headers,
    });
  }

  addCodeVerification(data: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + 'codes/', data, { headers });
  }

  getAllCodeVerification(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.settingUrl}codes/`, { headers });
  }

  getCodeVerification(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.settingUrl + 'codes/' + id + '/', {
      headers,
    });
  }

  updateCodeVerification(id: number, data: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(this.settingUrl + 'codes/' + id + '/', data, {
      headers,
    });
  }

  // service de supression de Parametres par id
  deleteParametres(id: number): Observable<Parametres> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<Parametres>(
      this.settingUrl + 'ParametresDetail/' + id + '/',
      { headers }
    );
  }
  // service de supression de Parametres par id
  deleteAttribut(id: number): Observable<Attribut> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<Attribut>(
      this.settingUrl + 'attributs/' + id + '/',
      { headers }
    );
  }

  deleteTypeVehicule(id: number): Observable<TypeVehicule> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<TypeVehicule>(
      this.settingUrl + 'typeVehicules/' + id + '/',
      { headers }
    );
  }
  deleteAutrePayement(id: number): Observable<AutrePayement> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<AutrePayement>(
      this.settingUrl + 'autrePayement/' + id + '/',
      { headers }
    );
  }
  deleteApi(id: number): Observable<CleAPI> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<CleAPI>(this.settingUrl + 'clesApi/' + id + '/', {
      headers,
    });
  }

  deleteAllParametres(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete(this.settingUrl + 'parametres/delete/', {
      headers,
    });
  }
}
