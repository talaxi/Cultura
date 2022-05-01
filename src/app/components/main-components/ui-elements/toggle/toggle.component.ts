import { Component, Input, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.css']
})
export class ToggleComponent implements OnInit {
  @Input() model: any;
  @Input() label: any;
  @Input() id: string;
  @Input() popoverText: string;
  @Input() callbackFunction: () => void;  

  constructor(private utilityService: UtilityService) { }

  ngOnInit(): void {
  
  }

  toggle(): void {
    if (this.callbackFunction !== undefined && this.callbackFunction !== null)
      this.callbackFunction();
  }

  getId() {
    return "cbxInput" + this.id;
  }
}
