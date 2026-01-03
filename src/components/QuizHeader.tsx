import "react-datepicker/dist/react-datepicker.css";
import ReactDatePicker from "react-datepicker";

interface Props {
    selectedDate: Date;
    setSelectedDate: (d: Date) => void;
    isCalendarOpen: boolean;
    setIsCalendarOpen: (o: boolean) => void;
}

const QuizHeader: React.FC<Props> = ({ selectedDate, setSelectedDate, isCalendarOpen, setIsCalendarOpen }) => (
    <header className="header-section">
        <div className="header-top">
            <h1 className="app-title">Daily Quiz</h1>
            <div className="history-control">
                <button className="history-button" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                    <span className="history-text">{isCalendarOpen ? "Close" : "History"}</span>
                    <span className="history-icon">📅</span>
                </button>
                {isCalendarOpen && (
                    <div className="calendar-dropdown">
                        <ReactDatePicker
                            selected={selectedDate}
                            onChange={(date: Date | null) => {
                                if (date) {
                                    setSelectedDate(date);
                                    setIsCalendarOpen(false);
                                }
                            }}
                            maxDate={new Date()}
                            inline
                        />
                    </div>
                )}
            </div>
        </div>
    </header>
);

export default QuizHeader;