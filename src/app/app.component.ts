import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	chipForm: FormGroup = this.fb.group({
		chips: [],
		chip: undefined
	});
	options: any[] = [];
	placeholder: string = "Search here";
	private optionsOriginal: any[] = [];

	log() {
		console.log(this.chipForm.value);
	}

	onQuery(query: string): void {
		let self = this;
		this.options = this.optionsOriginal.filter(filterFn);
		console.log("onQuery called", query, this.options);

		function filterFn(obj: string) {
			if (obj.toLowerCase().indexOf(query.toLowerCase()) >= 0)
				return true;
		}
	}

	onScroll(): void {
		this.optionsOriginal.push("Tony Stark")
		this.optionsOriginal.push("Robb Stark")
		this.optionsOriginal.push("Eddard Stark")
		this.optionsOriginal.push("Bruce Bannar")
		this.optionsOriginal.push("Luke Cage")
		this.options = Object.assign([], this.optionsOriginal);
		console.log("onScroll", this.options);
	}

	constructor(private fb: FormBuilder) { }

	ngOnInit() {
		this.optionsOriginal = ["Anand Kacha", "Luke Skywalker", "Anakin Skywalker", "Obi wan kanobi", "Han Solo", "Leia Skywalker", "Bruce Wayne", "Rohit Mehra", "Ra One"]
		this.options = Object.assign([], this.optionsOriginal);
		this.chipForm.controls["chip"].setValue(this.optionsOriginal[0]);
		this.chipForm.controls["chips"].setValue([this.optionsOriginal[0]]);
	}
}
