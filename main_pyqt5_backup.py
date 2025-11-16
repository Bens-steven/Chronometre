import sys
from PyQt5.QtWidgets import (QApplication, QWidget, QPushButton, QLabel, QVBoxLayout, QHBoxLayout, QLineEdit)
from PyQt5.QtCore import QTimer, QTime, Qt

class Stopwatch(QWidget):
    def __init__(self):
        super().__init__()
        self.time = QTime(0, 0, 0, 0)
        self.initial_time = QTime(0, 0, 0, 0)  # Temps initial pour le minuteur
        self.time_label = QLabel("00:00:00:00", self)
        self.start_button = QPushButton("Start", self)
        self.stop_button = QPushButton("Stop", self)
        self.reset_button = QPushButton("Reset", self)
        self.mode_button = QPushButton("Fenêtre", self)
        self.timer = QTimer(self)
        self.is_timer_mode = False  # False = chronomètre, True = minuteur
        self.init_ui()  # maintenant correct

    def init_ui(self):
        self.setWindowTitle("Ben est le meilleur")

        # Layout principal
        main_layout = QVBoxLayout()
        
        # Layout horizontal pour le bouton Fenêtre en haut à droite
        top_layout = QHBoxLayout()
        top_layout.addStretch()  # Pousse le bouton vers la droite
        self.mode_button.setFixedSize(100, 40)
        self.mode_button.setStyleSheet("font-size: 14px; padding: 5px;")
        top_layout.addWidget(self.mode_button)
        main_layout.addLayout(top_layout)

        # Champs pour définir le temps initial du minuteur (cachés au début)
        self.time_input_layout = QHBoxLayout()
        self.hour_label = QLabel("H:")
        self.minute_label = QLabel("M:")
        self.second_label = QLabel("S:")
        self.hour_input = QLineEdit("0")
        self.minute_input = QLineEdit("0")
        self.second_input = QLineEdit("0")
        self.hour_input.setPlaceholderText("Heures")
        self.minute_input.setPlaceholderText("Minutes")
        self.second_input.setPlaceholderText("Secondes")
        self.hour_input.setMaximumWidth(80)
        self.minute_input.setMaximumWidth(80)
        self.second_input.setMaximumWidth(80)
        self.set_time_button = QPushButton("Définir", self)
        
        self.time_input_layout.addWidget(self.hour_label)
        self.time_input_layout.addWidget(self.hour_input)
        self.time_input_layout.addWidget(self.minute_label)
        self.time_input_layout.addWidget(self.minute_input)
        self.time_input_layout.addWidget(self.second_label)
        self.time_input_layout.addWidget(self.second_input)
        self.time_input_layout.addWidget(self.set_time_button)
        self.time_input_layout.setAlignment(Qt.AlignCenter)
        
        # Cacher les champs de temps au début (mode chronomètre)
        self.hour_label.setVisible(False)
        self.minute_label.setVisible(False)
        self.second_label.setVisible(False)
        self.hour_input.setVisible(False)
        self.minute_input.setVisible(False)
        self.second_input.setVisible(False)
        self.set_time_button.setVisible(False)
        
        main_layout.addLayout(self.time_input_layout)

        # Label du temps
        vbox = QVBoxLayout()
        vbox.addWidget(self.time_label)
        self.time_label.setAlignment(Qt.AlignCenter)

        # Boutons de contrôle
        hbox = QHBoxLayout()
        hbox.addWidget(self.start_button)
        hbox.addWidget(self.stop_button)
        hbox.addWidget(self.reset_button)
        vbox.addLayout(hbox)

        main_layout.addLayout(vbox)
        self.setLayout(main_layout)

        self.setStyleSheet("""
            QPushButton#start_button, QPushButton#stop_button, QPushButton#reset_button { 
                padding: 20px;
                font-weight: bold;
                font-family: 'calibri';
                font-size: 50px;
            }
            QLabel#time_label {
                padding: 20px;
                font-weight: bold;
                font-family: 'calibri';
                font-size: 120px;
                background-color: hsl(217, 100%, 88%);
                border-radius: 20px;
            }
            QLineEdit {
                padding: 5px;
                font-size: 16px;
                border: 2px solid #ccc;
                border-radius: 5px;
            }
            QPushButton#set_time_button {
                padding: 10px;
                font-size: 16px;
                font-weight: bold;
            }""")
        
        # Définir les object names pour le style
        self.start_button.setObjectName("start_button")
        self.stop_button.setObjectName("stop_button")
        self.reset_button.setObjectName("reset_button")
        self.time_label.setObjectName("time_label")
        self.set_time_button.setObjectName("set_time_button")
        self.start_button.clicked.connect(self.start)
        self.stop_button.clicked.connect(self.stop)
        self.reset_button.clicked.connect(self.reset)
        self.mode_button.clicked.connect(self.toggle_mode)
        self.set_time_button.clicked.connect(self.set_initial_time)
        self.timer.timeout.connect(self.update_display)
        
    def toggle_mode(self):
        """Bascule entre le mode chronomètre et minuteur"""
        self.timer.stop()
        self.is_timer_mode = not self.is_timer_mode
        
        if self.is_timer_mode:
            # Mode minuteur - afficher les champs de saisie
            self.hour_label.setVisible(True)
            self.minute_label.setVisible(True)
            self.second_label.setVisible(True)
            self.hour_input.setVisible(True)
            self.minute_input.setVisible(True)
            self.second_input.setVisible(True)
            self.set_time_button.setVisible(True)
            # Réinitialiser avec le temps initial
            self.time = QTime(self.initial_time.hour(), self.initial_time.minute(), 
                            self.initial_time.second(), self.initial_time.msec())
        else:
            # Mode chronomètre - cacher les champs de saisie
            self.hour_label.setVisible(False)
            self.minute_label.setVisible(False)
            self.second_label.setVisible(False)
            self.hour_input.setVisible(False)
            self.minute_input.setVisible(False)
            self.second_input.setVisible(False)
            self.set_time_button.setVisible(False)
            # Réinitialiser à zéro
            self.time = QTime(0, 0, 0, 0)
        
        self.time_label.setText(self.format_time(self.time))
        
    def set_initial_time(self):
        """Définit le temps initial du minuteur"""
        try:
            hours = int(self.hour_input.text() or "0")
            minutes = int(self.minute_input.text() or "0")
            seconds = int(self.second_input.text() or "0")
            
            # Valider les valeurs
            hours = max(0, min(99, hours))
            minutes = max(0, min(59, minutes))
            seconds = max(0, min(59, seconds))
            
            self.initial_time = QTime(hours, minutes, seconds, 0)
            self.time = QTime(hours, minutes, seconds, 0)
            self.time_label.setText(self.format_time(self.time))
            
            # Mettre à jour les champs
            self.hour_input.setText(str(hours))
            self.minute_input.setText(str(minutes))
            self.second_input.setText(str(seconds))
        except ValueError:
            pass  # Ignorer les erreurs de conversion
        
    def start(self):
        self.timer.start(10)

    def stop(self):
        self.timer.stop()

    def reset(self):
        self.timer.stop()
        if self.is_timer_mode:
            # Réinitialiser au temps initial en mode minuteur
            self.time = QTime(self.initial_time.hour(), self.initial_time.minute(), 
                            self.initial_time.second(), self.initial_time.msec())
        else:
            # Réinitialiser à zéro en mode chronomètre
            self.time = QTime(0, 0, 0, 0)
        self.time_label.setText(self.format_time(self.time))

    def format_time(self, time):
        hours = time.hour()
        minutes = time.minute()
        seconds = time.second()
        milliseconds = time.msec() // 10
        return f"{hours:02}:{minutes:02}:{seconds:02}:{milliseconds:02}" 

    def update_display(self):
        if self.is_timer_mode:
            # Mode minuteur : compter à rebours
            if self.time.hour() == 0 and self.time.minute() == 0 and self.time.second() == 0 and self.time.msec() < 10:
                # Atteint zéro, arrêter
                self.timer.stop()
                self.time = QTime(0, 0, 0, 0)
            else:
                # Soustraire 10 ms
                total_ms = self.time.hour() * 3600000 + self.time.minute() * 60000 + \
                          self.time.second() * 1000 + self.time.msec()
                total_ms = max(0, total_ms - 10)
                hours = total_ms // 3600000
                minutes = (total_ms % 3600000) // 60000
                seconds = (total_ms % 60000) // 1000
                milliseconds = (total_ms % 1000)
                self.time = QTime(hours, minutes, seconds, milliseconds)
        else:
            # Mode chronomètre : compter vers le haut
            self.time = self.time.addMSecs(10)
        
        self.time_label.setText(self.format_time(self.time))

if __name__ == "__main__":
    app = QApplication(sys.argv)
    stopwatch = Stopwatch()
    stopwatch.show()
    sys.exit(app.exec_())

