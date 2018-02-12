import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	chipForm: FormGroup = this.fb.group({
		chips: []
	});
	options: string[] = [];
	// chips: string[] = ["One", "Two"];

	log() {
		console.log(this.chipForm.value);
	}

	onQuery(query: string): void {
		console.log("onQuery called", query);
	}

	constructor(private fb: FormBuilder) { }

	ngOnInit() {
		this.chipForm.controls["chips"].setValue([{ name: "Anand", last: "Kacha" }, { name: "Jayraj", last: "Solanki" }])
	}
}
