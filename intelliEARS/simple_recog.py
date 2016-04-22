import sys, os
from pocketsphinx import *
import pyaudio

from hubComm import Communicator

comm = Communicator("intellihub.ece.iastate.edu", 5)

phrase_map = {
    "turn the light on": 1,
    "make the light blue": 2,
    "switch the fan on": 3,
}

AUDIO_SIZE = 1024
modeldir = "/usr/share/pocketsphinx/model"

# Create a decoder with certain model
config = Decoder.default_config()
config.set_string('-hmm', os.path.join(modeldir, 'hmm/en_US/hub4wsj_sc_8k'))
config.set_string('-dict', os.path.join(modeldir, 'en-us/cmudict-en-us.dict'))
config.set_string('-kws', 'keyphrase.list')

p = pyaudio.PyAudio()
stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=AUDIO_SIZE)
#stream.start_stream()

# Process audio chunk by chunk. On keyword detected perform action and restart search
decoder = Decoder(config)
logmath = decoder.get_logmath()
decoder.start_utt()

while True:
    buf = stream.read(AUDIO_SIZE, exception_on_overflow=False)
    decoder.process_raw(buf, False, False)
    hyp = decoder.hyp()
    if hyp != None:
        print("Best match: " + hyp.hypstr + ", score: " + hyp.best_score + ", confidence: " + logmath.exp(hyp.prob))
        comm.send_voice(phrase_map[hyp.hypstr])
        decoder.end_utt()
        decoder.start_utt()
