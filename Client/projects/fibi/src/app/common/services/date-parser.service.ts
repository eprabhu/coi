import { Injectable } from '@angular/core';
import { DateFormatPipe, DateFormatPipeWithTimeZone } from '../../shared/pipes/custom-date.pipe';

@Injectable()
export class DateParserService {

    constructor(private DateFormatPipe: DateFormatPipe, private DateFormatPipeWithTimeZone: DateFormatPipeWithTimeZone) { }

    /**
     *author Mahesh Sreenath V M
     *
     * @export
     * @param {(number | string)} date
     * @returns
     * converts the timestamp into dateformat currently hard coded into dd/mm/yyyy
     */
    parseDate(date: number | string , type = '', timeZone = false) {
        if (date) {
            const TAG = this.findTag(date);
            const DATES = this.formatDate(this.findDates(date ) , type , timeZone);
            return TAG ? this.addTagToDate(TAG, DATES) : DATES[0];
        } else {
            return '';
        }

    }
    /**
     *finds if there is any is or del tag associated with the string
     this is because we enclose dates in ins or del tag while comparing versions
     this help us find what tag has been used to enclose the dat
     *
     * @param {(number | string)} date
     * @returns
     */
    findTag(date: number | string) {
        return date.toString()[1] === 'i' ? 'ins' : date.toString()[1] === 'd' ? 'del' : '';
    }
    /**
     *formats the dates arry fto dd/mm/yyyy format dates are considered as array
     because there may be two dates to compare
     *
     * @param {Array<string>} dates
     * @returns
     */
    formatDate(dates: Array<string> , type, timeZone) {
        dates = dates.map(date => this.setDateFormat(parseInt(date, 10), type, timeZone ));
        return dates;
    }
    /**
     *find the timestamp from the date given first we remove the tags and replace them with #.
      then splits the string to find the actual timestamps from the HTML string
     *
     * @param {(number | string)} date
     * @returns
     */
    findDates(date: number | string) {
        return date.toString().replace(/<[^>]*>/g, '#').split('#').filter(Boolean);
    }

    /**
     *formats the given date to dd/mm/yyyy format
     *
     * @param {Date} date
     * @returns
     */
    setDateFormat(date: any , type = '', timeZone) {
        if (timeZone) {
            return  new Date(date) ? this.DateFormatPipeWithTimeZone.transform(date , type) : '' ;
        } else {
            return  new Date(date) ? this.DateFormatPipe.transform(date , type) : '' ;
        }
    }

    /**
     *add tags to the date field according to tag which was first initialized to it.
     we also check whether there another date that also need to enclosed in html tag
     the type of tag is found using the firstTag value.
     if first Tag is ins then ins will be used to enclose the date otherwise del in the case of
     date[1] if the first tag is ins then del will be used since the date[0] has already used ins tag
     *
     * @param {string} firstTag
     * @param {Array<string>} dates
     * @returns
     */
    addTagToDate(firstTag: string, dates: Array<string>) {
        dates[0] = firstTag === 'ins' ? '<ins>' + dates[0] + '</ins>' : '<del>' + dates[0] + '</del>';
        if (dates[1]) {
            dates[0] += ' ' + firstTag === 'ins' ? '<del>' + dates[1] + '</del>' : '<ins>' + dates[1] + '</ins>';
        }
        return dates[0];
    }
}
