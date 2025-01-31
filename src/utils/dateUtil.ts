import { formatDistanceToNow } from "date-fns";

class DateUtil {
  static formatDateToTimeAgo(date: Date): string {
    return formatDistanceToNow(date, { addSuffix: false } );
  }
}

export default DateUtil;