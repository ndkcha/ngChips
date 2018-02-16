/**
 * The test component for the ChipComponent
 * @author ndkcha
 */

import { ComponentFixture, TestBed, async, tick, fakeAsync, flushMicrotasks } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { Subscription } from "rxjs/Subscription";
import { ChipComponent } from "./chip.component";

let compInst: ChipComponent;
let fixture: ComponentFixture<ChipComponent>;

describe('ChipComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [ChipComponent]
        }).compileComponents();
    }));

    beforeEach(async(() => {
        fixture = TestBed.createComponent(ChipComponent);
        compInst = fixture.componentInstance;

        compInst.chip = undefined;
        compInst.options = [];
        compInst.threshold = 2;
        compInst.template = undefined;
        compInst.placeholder = "Search here";

        fixture.detectChanges();
    }));

    it("should create the component", () => {
        expect(compInst).toBeTruthy();
    });

    it("should initialize the values properly", () => {
        expect(compInst.chip).toBeUndefined("chips");
        expect(compInst.options.length).toBe(0, "options");
        expect(compInst.threshold).toBe(2, "threshold");
        expect(compInst.template).toBeUndefined("template");
        expect(compInst.placeholder).toBe("Search here", "placeholder");
    });

    it("should call onQuery", () => {
        let query: string = "search";

        compInst.onQueryTriggered(query);
        
        let onQ: Subscription = compInst.onQuery.subscribe((value: string): void => {
            expect(value).toBe(query);
            onQ.unsubscribe();
        });
    });

    it("should call onAdd", () => {
        let input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
        let i: string = "Anand";
        compInst.options = ["Anand"];
        
        compInst.addItem(0, input);

        expect(compInst.isOptions).toBeFalsy("options");
        expect(compInst.chip).toBe(i, "chip");

        let onA: Subscription = compInst.onAdd.subscribe((item: string): void => {
            expect(item).toBe(i, "item");
            onA.unsubscribe();
        });
    });

    it("should call onDelete", () => {
        let i: string = "Anand";
        compInst.chip = "Anand";

        compInst.deleteChip();

        expect(compInst.chip).toBeUndefined("chip");

        let onD: Subscription = compInst.onRemove.subscribe((item: string): void => {
            expect(item).toBe(i, "item");
            onD.unsubscribe();
        });
    });

    it("threshold should work as expected", fakeAsync(() => {
        let query: string = "q";
        let spy = spyOn(compInst.onQuery, "emit");

        compInst.onQueryTriggered(query);
        tick(1000);
        
        expect(spy.calls.count()).toBe(0, "with q");

        query = "query";
        compInst.onQueryTriggered(query);
        tick(1000);

        expect(spy.calls.count()).toBe(1, "with query");
    }));
});