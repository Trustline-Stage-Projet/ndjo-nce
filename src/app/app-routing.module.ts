import { RouterModule, Routes } from '@angular/router';
import { ConnexionComponent } from './components-connexion/connexion/connexion.component';
import { AddChauffeurComponent } from './interfacePartenaire/components-gve/chauffeurs/add-chauffeur/add-chauffeur.component';
import { UpdateChauffeursComponent } from './interfacePartenaire/components-gve/chauffeurs/update-chauffeurs/update-chauffeurs.component';
import { ViewChauffeursComponent } from './interfacePartenaire/components-gve/chauffeurs/view-chauffeurs/view-chauffeurs.component';
import { AddEntrepriseComponent } from './interfacePartenaire/components-gve/entreprise/add-entreprise/add-entreprise.component';
import { UpdateEntrepriseComponent } from './interfacePartenaire/components-gve/entreprise/update-entreprise/update-entreprise.component';
import { ViewEntrepriseComponent } from './interfacePartenaire/components-gve/entreprise/view-entreprise/view-entreprise.component';
import { AddPrixComponent } from './interfacePartenaire/components-gve/prix/add-prix/add-prix.component';
import { UpdatePrixComponent } from './interfacePartenaire/components-gve/prix/update-prix/update-prix.component';
import { ViewPrixComponent } from './interfacePartenaire/components-gve/prix/view-prix/view-prix.component';
import { AddVehiculeComponent } from './interfacePartenaire/components-gve/vehicules/add-vehicule/add-vehicule.component';
import { UpdateVehiculesComponent } from './interfacePartenaire/components-gve/vehicules/update-vehicules/update-vehicules.component';
import { ViewVehiculesComponent } from './interfacePartenaire/components-gve/vehicules/view-vehicules/view-vehicules.component';
import { AttributComponent } from './interfacePartenaire/components-parametres/attribut/attribut.component';
import { ParametresComponent } from './interfacePartenaire/components-parametres/parametres/parametres.component';
import { PaypalComponent } from './interfacePartenaire/components-parametres/paypal/paypal.component';
import { StripeComponent } from './interfacePartenaire/components-parametres/stripe/stripe.component';
import { TypeVehiculeComponent } from './interfacePartenaire/components-parametres/type-vehicule/type-vehicule.component';
import { VirementBancaireComponent } from './interfacePartenaire/components-parametres/virement-bancaire/virement-bancaire.component';
import { AuthGuard } from './utilitaire/services/auth.guard';
import { AuthentificationComponent } from './components-connexion/authentification/authentification.component';
import { ListeCourseComponent } from './interfacePartenaire/components-crm/liste-course/liste-course.component';
import { InfoCourseComponent } from './interfacePartenaire/components-crm/info-course/info-course.component';
import { ProfilComponent } from './interfaceChauffeur/profil/profil.component';
import { MesCoursesComponent } from './interfaceChauffeur/mes-courses/mes-courses.component';
import { DetailsCourseComponent } from './interfaceChauffeur/details-course/details-course.component';
import { UpdateProfilComponent } from './interfaceChauffeur/update-profil/update-profil.component';
import { NgModule } from '@angular/core';

const routes: Routes = [

  { path: '', redirectTo: 'log', pathMatch: 'full' },

  { path: 'log', component: ConnexionComponent },
  { path: 'register', component: AuthentificationComponent },

  { path: 'parametres', component: ParametresComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'listEntreprise', component: ViewEntrepriseComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'entreprise', component: AddEntrepriseComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'detailEntreprise/:id', component: UpdateEntrepriseComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'updateEntreprise/:id', component: UpdateEntrepriseComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },

  { path: 'listVehicules/:id', component: ViewVehiculesComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'vehicules', component: AddVehiculeComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'detailVehicules/:id', component: UpdateVehiculesComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'updateVehicules/:id', component: UpdateVehiculesComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },

  { path: 'listChauffeurs/:id', component: ViewChauffeursComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'chauffeurs', component: AddChauffeurComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'detailChauffeurs/:id', component: UpdateChauffeursComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'updateChauffeurs/:id', component: UpdateChauffeursComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },

  { path: 'prix', component: AddPrixComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'listPrix', component: ViewPrixComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'detailPrix/:id', component: UpdatePrixComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'updatePrix/:id', component: UpdatePrixComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },

  { path: 'addAttribut', component: AttributComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'updateAttribut/:id', component: AttributComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'deleteAttribut/:id', component: AttributComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },

  { path: 'addType', component: TypeVehiculeComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'updateType/:id', component: TypeVehiculeComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'deleteType/:id', component: TypeVehiculeComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },


  { path: 'addPaypal', component: PaypalComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'updatePaypal/:id', component: PaypalComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },

  { path: 'addStripe', component: StripeComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'updateStripe/:id', component: StripeComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },

  { path: 'addVirement', component: VirementBancaireComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'updateVirement/:id', component: VirementBancaireComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },

  { path: 'course', component: ListeCourseComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },
  { path: 'infoCourse/:id', component: InfoCourseComponent, canActivate: [AuthGuard], data: { expectedType: 'partenaire' } },

  { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard], data: { expectedType: 'chauffeur' } },
  { path: 'mesCourses', component: MesCoursesComponent, canActivate: [AuthGuard], data: { expectedType: 'chauffeur' } },
  { path: 'detailsCourse/:id', component: DetailsCourseComponent, canActivate: [AuthGuard], data: { expectedType: 'chauffeur' } },
  { path: 'updateProfil/:id', component: UpdateProfilComponent, canActivate: [AuthGuard], data: { expectedType: 'chauffeur' } },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
