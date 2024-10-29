"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var updateLocale_1 = __importDefault(require("dayjs/plugin/updateLocale"));
var localeData_1 = __importDefault(require("dayjs/plugin/localeData"));
var isSameOrBefore_1 = __importDefault(require("dayjs/plugin/isSameOrBefore"));
var isSameOrAfter_1 = __importDefault(require("dayjs/plugin/isSameOrAfter"));
var dayjs_1 = __importDefault(require("dayjs"));
var DEFAULT_WORKING_HOURS = {
    sunday: null,
    monday: [{ start: '09:00:00', end: '17:00:00' }],
    tuesday: [{ start: '09:00:00', end: '17:00:00' }],
    wednesday: [{ start: '09:00:00', end: '17:00:00' }],
    thursday: [{ start: '09:00:00', end: '17:00:00' }],
    friday: [{ start: '09:00:00', end: '17:00:00' }],
    saturday: null,
};
var DaysNames;
(function (DaysNames) {
    DaysNames[DaysNames["sunday"] = 0] = "sunday";
    DaysNames[DaysNames["monday"] = 1] = "monday";
    DaysNames[DaysNames["tuesday"] = 2] = "tuesday";
    DaysNames[DaysNames["wednesday"] = 3] = "wednesday";
    DaysNames[DaysNames["thursday"] = 4] = "thursday";
    DaysNames[DaysNames["friday"] = 5] = "friday";
    DaysNames[DaysNames["saturday"] = 6] = "saturday";
})(DaysNames || (DaysNames = {}));
var businessTime = function (option, DayjsClass, dayjsFactory) {
    dayjsFactory.extend(localeData_1.default);
    dayjsFactory.extend(updateLocale_1.default);
    dayjsFactory.extend(isSameOrBefore_1.default);
    dayjsFactory.extend(isSameOrAfter_1.default);
    setBusinessTime(DEFAULT_WORKING_HOURS);
    setHolidays([]);
    function getLocale() {
        return dayjsFactory.Ls[(0, dayjs_1.default)().locale()];
    }
    function updateLocale(newData) {
        dayjsFactory.updateLocale((0, dayjs_1.default)().locale(), __assign({}, newData));
    }
    function getHolidays() {
        return getLocale().holidays || [];
    }
    function setHolidays(holidays) {
        updateLocale({ holidays: holidays });
    }
    function getBusinessTime() {
        return getLocale().businessHours;
    }
    function setBusinessTime(businessHours) {
        updateLocale({ businessHours: businessHours });
    }
    function isHoliday() {
        var today = this.format('YYYY-MM-DD');
        var holidays = getHolidays();
        return holidays.includes(today);
    }
    function isBusinessDay() {
        var businessHours = getBusinessTime();
        var dayName = DaysNames[this.day()];
        var isDefaultWorkingDay = !!businessHours[dayName];
        return isDefaultWorkingDay && !this.isHoliday();
    }
    function addOrsubtractBusinessDays(date, numberOfDays, action) {
        if (action === void 0) { action = 'add'; }
        var daysToIterate = numberOfDays;
        var day = date.clone();
        var relativeAction = action;
        if (numberOfDays < 0) {
            if (action === 'add') {
                relativeAction = 'subtract';
            }
            if (action === 'subtract') {
                relativeAction = 'add';
            }
        }
        while (daysToIterate) {
            day = day[relativeAction](1, 'day');
            if (day.isBusinessDay()) {
                if (numberOfDays < 0) {
                    daysToIterate = daysToIterate + 1;
                }
                else {
                    daysToIterate = daysToIterate - 1;
                }
            }
        }
        return day;
    }
    function nextBusinessDay() {
        return addOrsubtractBusinessDays(this, 1);
    }
    function lastBusinessDay() {
        return addOrsubtractBusinessDays(this, 1, 'subtract');
    }
    function addBusinessDays(numberOfDays) {
        return addOrsubtractBusinessDays(this, numberOfDays);
    }
    function subtractBusinessDays(numberOfDays) {
        return addOrsubtractBusinessDays(this, numberOfDays, 'subtract');
    }
    function timeStringToDayJS(timeString, date) {
        if (date === void 0) { date = (0, dayjs_1.default)(); }
        var _a = timeString.split(':'), hours = _a[0], minutes = _a[1], seconds = _a[2];
        return date
            .clone()
            .hour(hours)
            .minute(minutes)
            .second(seconds)
            .millisecond(0);
    }
    function getBusinessTimeSegments(day) {
        if (!day.isBusinessDay()) {
            return null;
        }
        var date = day.clone();
        var dayName = DaysNames[date.day()];
        var businessHours = getBusinessTime()[dayName];
        return businessHours.reduce(function (segments, businessTime, index) {
            var start = businessTime.start, end = businessTime.end;
            start = timeStringToDayJS(start, date);
            end = timeStringToDayJS(end, date);
            segments.push({ start: start, end: end });
            return segments;
        }, []);
    }
    function getCurrentBusinessTimeSegment(date) {
        var businessSegments = getBusinessTimeSegments(date);
        if (!(businessSegments === null || businessSegments === void 0 ? void 0 : businessSegments.length)) {
            return false;
        }
        return businessSegments.find(function (businessSegment) {
            var start = businessSegment.start, end = businessSegment.end;
            return date.isSameOrAfter(start) && date.isSameOrBefore(end);
        });
    }
    function isBusinessTime() {
        return !!getCurrentBusinessTimeSegment(this);
    }
    function nextBusinessTime() {
        if (!this.isBusinessDay()) {
            var nextBusinessDay_1 = this.nextBusinessDay();
            return getBusinessTimeSegments(nextBusinessDay_1)[0].start;
        }
        var segments = getBusinessTimeSegments(this);
        for (var index = 0; index < segments.length; index++) {
            var _a = segments[index], start = _a.start, end = _a.end;
            var isLastSegment = index === segments.length - 1;
            if (this.isBefore(start)) {
                return start;
            }
            if (this.isAfter(end)) {
                if (!isLastSegment) {
                    continue;
                }
                var nextBusinessDay_2 = this.nextBusinessDay();
                return getBusinessTimeSegments(nextBusinessDay_2)[0].start;
            }
            return this.clone();
        }
    }
    function lastBusinessTime() {
        if (!this.isBusinessDay()) {
            var lastBusinessDay_1 = this.lastBusinessDay();
            var end = getBusinessTimeSegments(lastBusinessDay_1).pop().end;
            return end;
        }
        var segments = getBusinessTimeSegments(this).reverse();
        for (var index = 0; index < segments.length; index++) {
            var _a = segments[index], start = _a.start, end = _a.end;
            var isFirstSegment = index === segments.length - 1;
            if (this.isAfter(end)) {
                return end;
            }
            if (this.isBefore(start)) {
                if (!isFirstSegment) {
                    continue;
                }
                var lastBusinessDay_2 = this.lastBusinessDay();
                return getBusinessTimeSegments(lastBusinessDay_2).pop().end;
            }
            return this.clone();
        }
    }
    function addBusinessMinutes(minutesToAdd) {
        return addOrSubtractBusinessMinutes(this, minutesToAdd);
    }
    function addBusinessHours(hoursToAdd) {
        var minutesToAdd = hoursToAdd * 60;
        return this.addBusinessMinutes(minutesToAdd);
    }
    function addBusinessTime(timeToAdd, businessUnit) {
        if (businessUnit.match(/^(minute)+s?$/)) {
            return this.addBusinessMinutes(timeToAdd);
        }
        if (businessUnit.match(/^(hour)+s?$/)) {
            return this.addBusinessHours(timeToAdd);
        }
        if (businessUnit.match(/^(day)+s?$/)) {
            return this.addBusinessDays(timeToAdd);
        }
        throw new Error('Invalid Business Time Unit');
    }
    function addOrSubtractBusinessMinutes(day, numberOfMinutes, action) {
        if (action === void 0) { action = 'add'; }
        var date = action === 'add' ? day.nextBusinessTime() : day.lastBusinessTime();
        while (numberOfMinutes) {
            var segment = getCurrentBusinessTimeSegment(date);
            if (!segment) {
                date =
                    action === 'add' ? date.nextBusinessTime() : date.lastBusinessTime();
                continue;
            }
            var start = segment.start, end = segment.end;
            var compareBaseDate = action === 'add' ? end : date;
            var compareDate = action === 'add' ? date : start;
            var timeToJump = compareBaseDate.diff(compareDate, 'minute');
            if (timeToJump > numberOfMinutes) {
                timeToJump = numberOfMinutes;
            }
            numberOfMinutes -= timeToJump;
            if (!timeToJump && numberOfMinutes) {
                timeToJump = 1;
            }
            date = date[action](timeToJump, 'minute');
        }
        return date;
    }
    function subtractBusinessMinutes(minutesToSubtract) {
        return addOrSubtractBusinessMinutes(this, minutesToSubtract, 'subtract');
    }
    function subtractBusinessHours(hoursToSubtract) {
        var minutesToSubtract = hoursToSubtract * 60;
        return this.subtractBusinessMinutes(minutesToSubtract);
    }
    function subtractBusinessTime(timeToSubtract, businessUnit) {
        if (businessUnit.match(/^(minute)+s?$/)) {
            return this.subtractBusinessMinutes(timeToSubtract);
        }
        if (businessUnit.match(/^(hour)+s?$/)) {
            return this.subtractBusinessHours(timeToSubtract);
        }
        if (businessUnit.match(/^(day)+s?$/)) {
            return this.subtractBusinessDays(timeToSubtract);
        }
        throw new Error('Invalid Business Time Unit');
    }
    function fixDatesToCalculateDiff(base, comparator) {
        var from = base.clone();
        var to = comparator.clone();
        var multiplier = 1;
        if (base.isAfter(comparator)) {
            to = base.clone();
            from = comparator.clone();
            multiplier = -1;
        }
        if (!from.isBusinessTime()) {
            from = from.lastBusinessTime();
        }
        if (!to.isBusinessTime()) {
            to = to.nextBusinessTime();
        }
        return { from: from, to: to, multiplier: multiplier };
    }
    function businessDaysDiff(comparator) {
        var _a = fixDatesToCalculateDiff(this, comparator), from = _a.from, to = _a.to, multiplier = _a.multiplier;
        var diff = 0;
        while (!from.isSame(to, 'day')) {
            diff += 1;
            from = from.addBusinessDays(1);
        }
        return diff ? diff * multiplier : 0;
    }
    function businessMinutesDiff(comparator) {
        var _a = fixDatesToCalculateDiff(this, comparator), from = _a.from, to = _a.to, multiplier = _a.multiplier;
        var diff = 0;
        var isSameDayfromTo = from.isSame(to, 'day');
        if (isSameDayfromTo) {
            var fromSegments = getBusinessTimeSegments(from);
            for (var _i = 0, fromSegments_1 = fromSegments; _i < fromSegments_1.length; _i++) {
                var segment = fromSegments_1[_i];
                var start = segment.start, end = segment.end;
                if (to.isSameOrAfter(start) &&
                    to.isSameOrBefore(end) &&
                    from.isSameOrAfter(start) &&
                    from.isSameOrBefore(end)) {
                    diff += to.diff(from, 'minutes');
                    break;
                }
                else if (to.isSameOrAfter(start) && to.isSameOrBefore(end)) {
                    diff += to.diff(start, 'minutes');
                    break;
                }
                else if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) {
                    diff += end.diff(from, 'minutes');
                }
            }
            return diff ? diff * multiplier : 0;
        }
        var segments = getBusinessTimeSegments(from);
        for (var _b = 0, segments_1 = segments; _b < segments_1.length; _b++) {
            var segment = segments_1[_b];
            var start = segment.start, end = segment.end;
            if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) {
                diff += end.diff(from, 'minutes');
            }
            else if (start.isSameOrAfter(from)) {
                diff += end.diff(start, 'minutes');
            }
        }
        from = from.addBusinessDays(1);
        while (from.isBefore(to, 'day')) {
            segments = getBusinessTimeSegments(from);
            for (var _c = 0, segments_2 = segments; _c < segments_2.length; _c++) {
                var segment = segments_2[_c];
                var start = segment.start, end = segment.end;
                diff += end.diff(start, 'minutes');
            }
            from = from.addBusinessDays(1);
        }
        var toSegments = getBusinessTimeSegments(to);
        for (var _d = 0, toSegments_1 = toSegments; _d < toSegments_1.length; _d++) {
            var segment = toSegments_1[_d];
            var start = segment.start, end = segment.end;
            if (to.isSameOrAfter(start) && to.isSameOrBefore(end)) {
                diff += to.diff(start, 'minutes');
            }
            else if (end.isSameOrBefore(to)) {
                diff += end.diff(start, 'minutes');
            }
        }
        return diff ? diff * multiplier : 0;
    }
    function businessHoursDiff(comparator) {
        var minutesDiff = this.businessMinutesDiff(comparator);
        return minutesDiff / 60;
    }
    function businessTimeDiff(comparator, businessUnit) {
        if (businessUnit.match(/^(minute)+s?$/)) {
            return this.businessMinutesDiff(comparator);
        }
        if (businessUnit.match(/^(hour)+s?$/)) {
            return this.businessHoursDiff(comparator);
        }
        if (businessUnit.match(/^(day)+s?$/)) {
            return this.businessDaysDiff(comparator);
        }
        throw new Error('Invalid Business Time Unit');
    }
    dayjsFactory.getHolidays = getHolidays;
    dayjsFactory.setHolidays = setHolidays;
    dayjsFactory.getBusinessTime = getBusinessTime;
    dayjsFactory.setBusinessTime = setBusinessTime;
    DayjsClass.prototype.isHoliday = isHoliday;
    DayjsClass.prototype.isBusinessDay = isBusinessDay;
    DayjsClass.prototype.nextBusinessDay = nextBusinessDay;
    DayjsClass.prototype.lastBusinessDay = lastBusinessDay;
    DayjsClass.prototype.addBusinessDays = addBusinessDays;
    DayjsClass.prototype.subtractBusinessDays = subtractBusinessDays;
    DayjsClass.prototype.isBusinessTime = isBusinessTime;
    DayjsClass.prototype.nextBusinessTime = nextBusinessTime;
    DayjsClass.prototype.lastBusinessTime = lastBusinessTime;
    DayjsClass.prototype.addBusinessTime = addBusinessTime;
    DayjsClass.prototype.addBusinessHours = addBusinessHours;
    DayjsClass.prototype.addBusinessMinutes = addBusinessMinutes;
    DayjsClass.prototype.subtractBusinessMinutes = subtractBusinessMinutes;
    DayjsClass.prototype.subtractBusinessHours = subtractBusinessHours;
    DayjsClass.prototype.subtractBusinessTime = subtractBusinessTime;
    DayjsClass.prototype.businessMinutesDiff = businessMinutesDiff;
    DayjsClass.prototype.businessHoursDiff = businessHoursDiff;
    DayjsClass.prototype.businessDaysDiff = businessDaysDiff;
    DayjsClass.prototype.businessTimeDiff = businessTimeDiff;
};
exports.default = businessTime;
exports = module.exports = businessTime;
//# sourceMappingURL=index.js.map