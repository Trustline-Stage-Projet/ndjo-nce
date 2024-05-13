import { Component, OnInit } from '@angular/core';
import { CrmService } from 'src/app/utilitaire/services/crm.service';

@Component({
  selector: 'app-view-prix',
  templateUrl: './view-prix.component.html',
  styleUrls: ['./view-prix.component.css']
})
export class ViewPrixComponent implements OnInit {

  prixList: any[] = [];
  Count!: number;

  constructor(private _gveService: CrmService) { }

  ngOnInit(): void {
    this.getPrixList();
  }

  getPrixList(): void {
    this._gveService.getPrix().subscribe((data) => {
      this.prixList = data;
      this.Count = this.prixList.length;
    });
  }
}
