import { Component, Input, OnInit } from '@angular/core';
import { AnimalTraits } from 'src/app/models/animals/animal-traits.model';
import { GlobalService } from 'src/app/services/global-service.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-trait-option',
  templateUrl: './trait-option.component.html',
  styleUrls: ['./trait-option.component.css']
})
export class TraitOptionComponent implements OnInit {
  @Input() trait: AnimalTraits;
  traitLevel: number;

  constructor(private globalService: GlobalService, private lookupService: LookupService) { }

  ngOnInit(): void {
    this.traitLevel = this.lookupService.getResearchLevel();
  }
}
