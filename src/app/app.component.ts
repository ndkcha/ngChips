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
	options: any[] = [];
	placeholder: string = "Search here";
	// chips: string[] = ["One", "Two"];

	log() {
		console.log(this.chipForm.value);
	}

	onQuery(query: string): void {
		console.log("onQuery called", query);
		this.options = [{ name: "Anand", last: "Kacha" }, { name: "Anakin", last: "Skywalker" }];
	}

	constructor(private fb: FormBuilder) { }

	ngOnInit() {
		this.chipForm.controls["chips"].setValue([{ name: "Luke", last: "Skywalker" }])
		this.options = [{ name: "Anand", last: "Kacha" }, { name: "Obi wan", last: "Kanobi" }];
	}
}
