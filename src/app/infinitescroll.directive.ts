/**
 * The directive that triggers an event everytime the user scrolls to the bottom of the parent element.
 * You can customize the scroll percentage in order to manage the trigger.
 * 
 * Parameters:
 * [scrollCallback] = Callback to execute when the user scroll to the bottom.
 * [immediateCallBack] = Handle the first callback. If true, it will call the callback as soon as the component is rendered.
 * [scrollPercent] = The percentage the user should scroll the box for onScroll to be called.
 * 
 * Usage:
 * 
 * <div infiniteScroller scrollPercent="80" [scrollCallback]="callback">
 * 
 * component file:
 * callback: any;
 * 
 * constructor() {
 *      callback = this.actualCallback.bind(this);
 * }
 * 
 * actualCallback() {
 *      [actions here]
 * }
 * @author ndkcha
 */

// import helpers
import { Directive, AfterViewInit, ElementRef, Input } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/exhaustMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/startWith';

/** The signature to record the position of the scroll box. */
interface ScrollPosition {
    /** scroll height */
    sH: number;
    /** scroll top */
    sT: number;
    /** client height */
    cH: number;
};

/** Something to start with. (used when immediateCallback is true) */
const DEFAULT_SCROLL_POSITION: ScrollPosition = {
    sH: 0,
    sT: 0,
    cH: 0
};

@Directive({
    selector: '[infiniteScroller]'
})
/** The directive for infinite scroller */
export class InfiniteScrollerDirective implements AfterViewInit {
    // helping observables. actions are as the names suggests
    private scrollEvent$: Observable<any>;
    private userScrolledDown$: Observable<any>;
    private requestStream$: Observable<any>;
    private requestOnScroll$: Observable<any>;

    /** Callback to execute when the user scroll to the bottom. */
    @Input() scrollCallback: any;
    /** Handle the first callback. If true, it will call the callback as soon as the component is rendered. */
    @Input() immediateCallback: boolean;
    /** The percentage the user should scroll the box for onScroll to be called. */
    @Input() scrollPercent: number;

    constructor(private elm: ElementRef) { }

    // after the view is initialized
    ngAfterViewInit() {
        if (this.scrollCallback == undefined)
            return;
        this.registerScrollEvent();
        this.streamScrollEvents();
        this.requestCallbackOnScroll();

    }

    /** Add a listener for scroll events from the element. */
    private registerScrollEvent(): void {
        this.scrollEvent$ = Observable.fromEvent(this.elm.nativeElement, 'scroll');
    }

    /** Process the incoming stream of scroll events according to the requirements and condition of scroll percentage to determine when to make the callback call. */
    private streamScrollEvents(): void {
        this.userScrolledDown$ = this.scrollEvent$
            .map((e: any): ScrollPosition => ({
                sH: e.target.scrollHeight,
                sT: e.target.scrollTop,
                cH: e.target.clientHeight
            }))
            .pairwise()
            .filter((positions: ScrollPosition[]): boolean => isUserScrollingDown(positions) && this.isScrollExpectedPercent(positions[1]))

            function isUserScrollingDown(positions: ScrollPosition[]): boolean {
                return positions[0].sT < positions[1].sT;
            }
    }

    /** Once it passes our condition we call the scrollCallback */
    private requestCallbackOnScroll(): void {
        this.requestOnScroll$ = this.userScrolledDown$;

        if (this.immediateCallback) {
            this.requestOnScroll$ = this.requestOnScroll$
                .startWith([DEFAULT_SCROLL_POSITION, DEFAULT_SCROLL_POSITION]);
        }

        this.requestOnScroll$.subscribe((data) => { this.scrollCallback() }, (err) => console.log(err));
    }

    /** Check the qualifying condition */
    private isScrollExpectedPercent = (position: ScrollPosition): boolean => {
        return ((position.sT + position.cH) / position.sH) > (this.scrollPercent / 100);
    }

}