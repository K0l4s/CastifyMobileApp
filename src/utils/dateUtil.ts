import { formatDistanceToNow } from "date-fns";

class DateUtil {
  static formatDateToTimeAgo(date: Date): string {
    return formatDistanceToNow(date, { addSuffix: false } );
  }

  static formatTimeDuration(durationInSeconds: number) {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else {
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
  }
}

export default DateUtil;