import socket
import struct
import binascii
import time

class Communicator:
    def __init__(self, hub_name, node_id):
        self.hub_name = hub_name
        self.my_id = node_id
        self.setup_conn()

    def setup_conn(self):
        self.s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            self.s.connect((self.hub_name, 80))
        except Exception as e:
            time.sleep(3)
            self.setup_conn()
            return
        
        self.notify_connected()

    def send_message(self, type_identifier, payload):
        # Start byte
        message = bytearray([0xAA])
        message.extend(bytearray(struct.pack('>I', self.my_id)))

        # Add the message type
        message.append(type_identifier)

        # Add the payload length
        payload_size = len(payload)
        message.extend(bytearray(struct.pack('>H', payload_size)))

        # Add the payload itself
        message.extend(payload)

        # Send the message
        try:
            self.s.sendall(message)
        except Exception as e:
            print("Trying to repair connection")
            self.setup_conn()
            self.s.sendall(message)


    def notify_connected(self):
        self.send_message(0x00, bytearray())

    def send_voice(self, command_num):
        packed_value = bytearray(struct.pack('>i', command_num))
        self.send_message(0x05, packed_value)

if __name__ == "__main__":
    comm = Communicator("intellihub.ece.iastate.edu", 5)
    comm.send_voice(2)
