import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { SignOutButton } from '../../components/sign-out-button'

const ProfileScreen = () => {
    const { user } = useUser()

    return (
        <SafeAreaView style={styles.safeAreaStyle}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mon Profil</Text>
            </View>

            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={80} color="#4CAF50" />
                </View>

                <View style={styles.userInfoContainer}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>
                        {user?.primaryEmailAddress?.emailAddress}
                    </Text>
                </View>

                {user?.phoneNumbers[0]?.phoneNumber && (
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.label}>Téléphone</Text>
                        <Text style={styles.value}>
                            {user.phoneNumbers[0].phoneNumber}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.signOutContainer}>
                <SignOutButton />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeAreaStyle: {
        flex: 1,
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E2E2E',
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        padding: 24,
        marginBottom: 24,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    userInfoContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8C8C8C',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2E2E2E',
    },
    signOutContainer: {
        alignItems: 'center',
    },
})

export default ProfileScreen