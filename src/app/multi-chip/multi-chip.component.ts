/**
 * The UI component for Multi Chips Elements.
 * It supports the RectiveForms and ngModel as well. You can search for new chips and add to list. You can also assign custom template to the inputs.
 * It selects multiple chips at a time. Check out chip for the component that can select only single chip.
 * 
 * Parameters:
 * [options] = Suggestions to add new chips. The chips passed as an array in this parameter can be added later upon the user selection.
 * [threshold] = Threshold for displaying the suggestion box and triggering the onQuery event.
 * [template] = Custom template to assign to chips as well as the suggestion box.
 * [placeholder] = Custom text to display inside the searchbox as a placeholder.
 * (onQuery) = Triggers an event whenever the user finishes typing on the search box (passes the query as an argument).
 * (onAdd) = Triggers an event whenever a chip is added (passes the chip as an argument).
 * (onRemove) = Triggers an event whenever a chip is deleted (passes the chip as an argument).
 * 
 * Usages:
 * 
 *  - with only chips
 * <form [formGroup]="myForm">
 *      <cob-multi-chips formControlName="chips"></cob-multi-chips>
 * </form>
 * <cob-multi-chips [(ngModel)]="chips"></cob-multi-chips>
 * 
 *  - with custom template
 * <cob-multi-chips formControlName="chips" [template]="myTemplate"></cob-multi-chips>
 * <ng-template #myTemplate let-item="item">
 *      {{item.name}}
 * </ng-template>
 * 
 *  - with drop down options [with this options feature, you can search for new chips with dynamic data and a threshold for popping out the suggestions box]
 * <cob-multi-chips formControlName="chips" [options]="<an array>" [threshold]="3"></cob-multi-chips>
 * 
 *  - you can also load the dynamic data as you search into the box. (don't worry, it will wait for user to finish typing before the callback)
 * <cob-multi-chips formControlName="chips" [options]="<an array, changed by a function>" (onQuery)="onQuery($event)" [threshold]="2"></cob-multi-chips>
 * 
 * component file:
 * onQuery($event): void {
 *      this.options = <an array>;
 * }
 * @author ndkcha
 */

// import helper
import { Component, forwardRef, Input, Output, EventEmitter, TemplateRef, KeyValueDiffers, OnInit, KeyValueDiffer, KeyValueChanges, DoCheck } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

@Component({
    selector: 'cob-multi-chips',
    templateUrl: './multi-chip.component.html',
    styleUrls: ['./multi-chip.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => MultiChipsComponent),
        multi: true
    }]
})
/** The UI component for Chips Elements. */
export class MultiChipsComponent implements ControlValueAccessor, OnInit, DoCheck {
    onChange = (_: any[]) => {};
    /** The chips that are selected or pre loaded */
    @Input() _chips: any[] = [];
    /** Triggers an event whenever the user finishes typing on the search box (passes the query as an argument). */
    @Output() onQuery: EventEmitter<string> = new EventEmitter();
    /** Suggestions to add new chips. The chips passed as an array in this parameter can be added later upon the user selection. */
    @Input() options: any[];
    /** Threshold for displaying the suggestion box and triggering the onQuery event. */
    @Input() threshold: number = 2;
    /** Custom template to assign to chips as well as the suggestion box. */
    @Input() template: TemplateRef<any>;
    /** Triggers an event whenever a chip is added (passes the chip as an argument). */
    @Output() onAdd: EventEmitter<any> = new EventEmitter();
    /** Triggers an event whenever a chip is deleted (passes the chip as an argument). */
    @Output() onRemove: EventEmitter<any> = new EventEmitter();
    /** Detects the changes on the options parameter and helps triggering an event */
    private optionsDiffer: KeyValueDiffer<any, any>;
    /** Timeout handler to determine wheather the user has finished typing */
    private timeout = undefined;
    /** Placeholder for search box */
    @Input() placeholder: string = "Search here";
    /** Visibility handler for the options box */
    isOptions: boolean = false;
    /** Visibility control text */
    visibilityOptionControl: string = "&#8910;";

    /**
     * @param differs A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
     */
    constructor(private differs: KeyValueDiffers) { }

    ngOnInit() {
        // bind the watcher for the options parameter
        this.optionsDiffer = this.differs.find(this.options).create();
    }

    /**
     * Whenever the options parameter is changed, it checks for duplicates with the selected chips.
     * It helps ignoring the duplicates in the suggestions box to avoid duplicate tuples in output.
     * @param changes The object describing changes in the options parameter.
     */
    private optionChanged(changes: KeyValueChanges<any, any>) {
        let chips = this.chips;
        this.options = this.options.filter(filterOptions);

        function filterOptions(obj: any) {
            for (let i = 0; i < chips.length; i++) {
                if (JSON.stringify(chips[i]) == JSON.stringify(obj))
                    return false;
            }
            return true;
        }
    }

    ngDoCheck() {
        // detect the changes and call the relevant subroutine.
        const optChanges = this.optionsDiffer.diff(this.options);
        if (optChanges)
            this.optionChanged(optChanges);
    }

    /** Return the selected chips. (used to implement the form control) */
    get chips() {
        return this._chips;
    }

    /** Sets the chips to its newest value. (used to implement the form control) */
    set chips(val) {
        this._chips = val;
        this.onChange(this._chips);
    }

    /** Sets tue chips to its newest value. */
    writeValue(value: any[]) {
        if (value !== undefined)
            this.chips = value;
    }

    /** Registers the onChange event. (used to implement the form control) */
    registerOnChange(fn): void {
        this.onChange = fn;
    }

    /** Register the onTouched event. (used to implement the form control) */
    registerOnTouched() { };

    /**
     * Deletes a chip from the chips array.
     * It also triggers onRemove event to notify the parent component about the delete operation.
     * @param index The index of the chips in the array
     */
    deleteChip(index: number): void {
        this.onRemove.emit(this.chips[index]);
        this.chips.splice(index, 1);
    }

    /**
     * Triggers event when the user finishes writing in the options search box.
     * At first, the function checks if there is any existing timeout handler is working in the system or not.
     * If it's working, that means the user is already typing, cancel and clear that timeout because it's going to be replaced by the newer value anyways.
     * If it's not working, that means the user has finished the typing.
     * Start a new timeout based on the recent value the user have typed.
     * @param query the search query provided by user in input box.
     */
    onQueryTriggered(query: string): void {
        // wipe out existing suggestions before starting.
        this.isOptions = false;
        if (this.timeout) {
            window.clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        this.timeout = window.setTimeout(() => {
            if (query.length > this.threshold) {
                this.onQuery.emit(query);
                this.isOptions = true;
            }
        }, 1000);
    }

    /**
     * Subroutine to manually open the option box.
     */
    toggleOptions(): void {
        this.isOptions = !this.isOptions;
        this.visibilityOptionControl = this.isOptions ? "&#8911;" : "&#8910;";
    }

    /**
     * Add an item to the chips.
     * It simply adds from the options parameter provided by user.
     * It also triggers onAdd event to notify the parent component about the insertion operation.
     * @param index Index of the item in options parameter.
     * @param box Input box that provided the query.
     */
    addItem(index: number, box: HTMLInputElement): void {
        // item is to be added. clear the box.
        box.value = null;
        let option: any = this.options[index];
        this.chips.push(option);
        this.onAdd.emit(option);
        this.isOptions = false;
    }
}