import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './interfaceGenerale/footer/footer.component';
import { HeaderComponent } from './interfaceGenerale/header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ErrorsComponent } from './utilitaire/errors/errors.component';
import { DatePipe } from '@angular/common';
import { CrmService } from './utilitaire/services/crm.service';
import { AuthentificationComponent } from './components-connexion/authentification/authentification.component';
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
import { ListeCourseComponent } from './interfacePartenaire/components-crm/liste-course/liste-course.component';
import { InfoCourseComponent } from './interfacePartenaire/components-crm/info-course/info-course.component';
import { ProfilComponent } from './interfaceChauffeur/profil/profil.component';
import { MesCoursesComponent } from './interfaceChauffeur/mes-courses/mes-courses.component';
import { DetailsCourseComponent } from './interfaceChauffeur/details-course/details-course.component';
import { UpdateProfilComponent } from './interfaceChauffeur/update-profil/update-profil.component';
import { AuthInterceptor } from './utilitaire/interceptor/AuthInterceptor';


@NgModule({
  declarations: [
    AppComponent,
    ErrorsComponent,
    FooterComponent,
    HeaderComponent,
    ParametresComponent,
    AddEntrepriseComponent,
    ViewEntrepriseComponent,
    UpdateEntrepriseComponent,
    AddVehiculeComponent,
    AddPrixComponent,
    AddChauffeurComponent,
    ViewVehiculesComponent,
    ViewChauffeursComponent,
    UpdateChauffeursComponent,
    UpdateVehiculesComponent,
    UpdatePrixComponent,
    ViewPrixComponent,
    AttributComponent,
    TypeVehiculeComponent,
    StripeComponent,
    PaypalComponent,
    VirementBancaireComponent,
    ConnexionComponent,
    AuthentificationComponent,
    ListeCourseComponent,
    InfoCourseComponent,
    ProfilComponent,
    MesCoursesComponent,
    DetailsCourseComponent,
    UpdateProfilComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    NgSelectModule,
    SidebarModule,
    ButtonModule,
    AvatarModule,
    AvatarGroupModule
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    CrmService,
    {provide: HTTP_INTERCEPTORS,useClass: AuthInterceptor,multi: true,},
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
