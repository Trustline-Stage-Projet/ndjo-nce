import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { CrmService } from '../../utilitaire/services/crm.service';
import { Sidebar } from 'primeng/sidebar';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  // isCodeVerified = false;
  codeVerification = '';
  errorMessage = '';
  userInfo: any;
  userType: string = '';
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  sidebarVisible: boolean = false;

  constructor(
    private _modalService: NgbModal,
    private router: Router,
    private _crmService: CrmService
  ) {}

  ngOnInit() {
    this.userType = this._crmService.getUserType();

    this._crmService.getUserInfo().subscribe(
      (data) => {
        this.userInfo = data;
      },
      (error) => {
        console.error('erreur', error);
      }
    );
  }
  openCodeVerificationModal(content: any) {
    this._modalService.open(content, { backdrop: 'static', keyboard: false }); // Ouvrir le modal de vérification du code
  }

  // verifyCode() {
  //   this._crmService.getAllCodeVerification().subscribe(
  //     (response) => {
  //       // Vérifiez d'abord si la réponse contient au moins un élément
  //       if (response.length > 0) {
  //         const passAdmin = response[0].pass_admin;

  //         if (this.codeVerification === passAdmin || '123456') {
  //           this.errorMessage = '';
  //           this.isCodeVerified = true;
  //           this._modalService.dismissAll();
  //           this.codeVerification = '';
  //           this.router.navigate(['/parametres']);
  //         } else {
  //           this.errorMessage =
  //             "Code d'authentification incorrect. Veuillez réessayer.";
  //         }
  //       } else {
  //         this.errorMessage = "Aucun code d'authentification trouvé.";
  //       }
  //     },
  //     (error) => {
  //       console.error(
  //         'Erreur lors de la récupération des codes de vérification :',
  //         error
  //       );
  //     }
  //   );
  // }

  // resetMenu() {
  //   this.isCodeVerified = false;
  //   this.router.navigate(['/list']);
  // }

  logout() {
    this._crmService.logout().subscribe(
      () => {
        console.log('deconnexion reussi');
      },
      (error) => {
        console.error('erreur', error);
      }
    );
  }

  closeCallback(e: Event): void {
    this.sidebarRef.close(e);
  }
}
