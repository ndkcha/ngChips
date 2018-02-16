/**
 * The UI component for Chip Elements.
 * It supports the RectiveForms and ngModel as well. You can search for new chip and assign it. You can also assign custom template to the inputs.
 * It selects only one chip at a time. Check out multi-chips for the component that can select multiple chips
 * 
 * Parameters:
 * [options] = Suggestions to add new chips. The chips passed as an array in this parameter can be added later upon the user selection.
 * [threshold] = Threshold for displaying the suggestion box and triggering the onQuery event. (Default: 2)
 * [template] = Custom template to assign to chips as well as the suggestion box.
 * [placeholder] = Custom text to display inside the searchbox as a placeholder. (Default: "Search here")
 * [scrollPercent] = The percentage the user should scroll the box for onScroll to be called. (Default: 80)
 * (onQuery) = Triggers an event whenever the user finishes typing on the search box (passes the query as an argument).
 * (onAdd) = Triggers an event whenever a chip is added (passes the chip as an argument).
 * (onRemove) = Triggers an event whenever a chip is deleted (passes the chip as an argument).
 * (onScroll) = Triggers an event whenever user has scrolled down to the bottom.
 * 
 * Usages:
 * 
 *  - with only chips
 * <form [formGroup]="myForm">
 *      <cob-chip formControlName="chip"></cob-chip>
 * </form>
 * <cob-chip [(ngModel)]="chip"></cob-chip>
 * 
 *  - with custom template
 * <cob-chip formControlName="chip" [template]="myTemplate"></cob-chip>
 * <ng-template #myTemplate let-item="item">
 *      {{item.name}}
 * </ng-template>
 * 
 *  - with drop down options [with this options feature, you can search for new chips with dynamic data and a threshold for popping out the suggestions box]
 * <cob-chip formControlName="chip" [options]="<an array>" [threshold]="3"></cob-chip>
 * 
 *  - you can also load the dynamic data as you search into the box. (don't worry, it will wait for user to finish typing before the callback)
 * <cob-chip formControlName="chip" [options]="<an array, changed by a function>" (onQuery)="onQuery($event)" [threshold]="2"></cob-chip>
 * 
 * component file:
 * onQuery($event): void {
 *      this.options = <an array>;
 * }
 * 
 *  - you can also implement the infinite scroller for the chips component
 * <cob-chip formControlName="chip" scrollPercent="90" (onScroll)="onScroll()" [options]="<an array, changed by a function>" (onQuery)="onQuery($event)" [threshold]="2"></cob-chip>
 * 
 * component file:
 * onQuery($event): void {
 *      this.options = <an array>;
 * }
 * onScroll(): void {
 *      this.options = <an array>;
 * }
 * @author ndkcha
 */

// import helper
import { Component, forwardRef, Input, Output, EventEmitter, TemplateRef, KeyValueDiffers, OnInit, KeyValueDiffer, KeyValueChanges, DoCheck } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

@Component({
    selector: 'cob-chip',
    templateUrl: './chip.component.html',
    styleUrls: ['./chip.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ChipComponent),
        multi: true
    }]
})
/** The UI component for Chip Element. */
export class ChipComponent implements ControlValueAccessor, OnInit, DoCheck {
    onChange = (_: any[]) => {};
    /** The chip that is selected or pre loaded */
    @Input() _chip: any = undefined;
    /** Triggers an event whenever the user finishes typing on the search box (passes the query as an argument). */
    @Output() onQuery: EventEmitter<string> = new EventEmitter();
    /** Suggestions to add new chip. The chip passed as an array in this parameter can be added later upon the user selection. */
    @Input() options: any[];
    /** Threshold for displaying the suggestion box and triggering the onQuery event. */
    @Input() threshold: number = 2;
    /** Custom template to assign to chip as well as the suggestion box. */
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
    /** Visibility handler for the chip */
    isChip: boolean = false;
    /** Triggers an event whenever user has scrolled down to the bottom */
    @Output() onScroll: EventEmitter<boolean> = new EventEmitter();
    /** Callback function that notifies the parent component. And also binds to the current context */
    scrollCallback: any;
    /** The percentage the user should scroll the box for onScroll to be called */
    @Input() scrollPercent: number = 80;

    /**
     * @param differs A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
     */
    constructor(private differs: KeyValueDiffers) {
        this.scrollCallback = this.onScrollTrigger.bind(this);
    }

    ngOnInit() {
        // bind the watcher for the options parameter
        this.optionsDiffer = this.differs.find(this.options).create();
    }

    /** Notifies the parent component about the user being at the bottom of the scroll box. */
    onScrollTrigger() {
        this.onScroll.emit(true);
    }

    /**
     * Whenever the options parameter is changed, it checks for duplicates with the selected chip.
     * It helps ignoring the duplicates in the suggestions box to avoid duplicate tuples in output.
     * @param changes The object describing changes in the options parameter.
     */
    private optionChanged(changes: KeyValueChanges<any, any>) {
        let chip = this.chip;
        this.options = this.options.filter(filterOptions);

        function filterOptions(obj: any) {
            if (JSON.stringify(chip) == JSON.stringify(obj))
                return false;
            return true;
        }
    }

    ngDoCheck() {
        // detect the changes and call the relevant subroutine.
        const optChanges = this.optionsDiffer.diff(this.options);
        if (optChanges)
            this.optionChanged(optChanges);
    }

    /** Return the selected chip. (used to implement the form control) */
    get chip() {
        return this._chip;
    }

    /** Sets the chip to its newest value. (used to implement the form control) */
    set chip(val) {
        this._chip = val;
        this.isChip = (this.chip != undefined);
        this.onChange(this._chip);
    }

    /** Sets tue chip to its newest value. */
    writeValue(value: any) {
        this.isChip = (this.chip != undefined);
        this.chip = value;
    }

    /** Registers the onChange event. (used to implement the form control) */
    registerOnChange(fn): void {
        this.onChange = fn;
    }

    /** Register the onTouched event. (used to implement the form control) */
    registerOnTouched() { };

    /**
     * Deletes the chip.
     * It also triggers onRemove event to notify the parent component about the delete operation.
     */
    deleteChip(): void {
        this.onRemove.emit(this.chip);
        this.chip = undefined;
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
     * Assign an item to the chip.
     * It simply adds from the options parameter provided by user.
     * It also triggers onAdd event to notify the parent component about the insertion operation.
     * @param index Index of the item in options parameter.
     * @param box Input box that provided the query.
     */
    addItem(index: number, box: HTMLInputElement): void {
        // item is to be added. clear the box.
        box.value = null;
        let option: any = this.options[index];
        this.chip = option;
        this.onAdd.emit(option);
        this.isOptions = false;
    }
}